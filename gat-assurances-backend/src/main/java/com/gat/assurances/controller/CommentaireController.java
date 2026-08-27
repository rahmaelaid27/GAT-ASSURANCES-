package com.gat.assurances.controller;

import com.gat.assurances.dto.CommentaireCreateRequest;
import com.gat.assurances.entity.Commentaire;
import com.gat.assurances.entity.Sinistre;
import com.gat.assurances.entity.User;
import com.gat.assurances.entity.enums.TypeNotification;
import com.gat.assurances.exception.BusinessException;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.CommentaireRepository;
import com.gat.assurances.repository.MissionRepository;
import com.gat.assurances.repository.SinistreRepository;
import com.gat.assurances.repository.UserRepository;
import com.gat.assurances.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Forum", description = "Forum collaboratif par dossier sinistre")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/sinistres/{sinistreId}/commentaires")
@RequiredArgsConstructor
public class CommentaireController {

    private final CommentaireRepository commentaireRepository;
    private final MissionRepository     missionRepository;
    private final SinistreRepository    sinistreRepository;
    private final UserRepository        userRepository;
    private final NotificationService   notificationService;

    // ─── DTOs ─────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserInfo {
        private Long   id;
        private String nom;
        private String prenom;
        private String role;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageDto {
        private Long          id;
        private String        contenu;
        private String        pieceJointe;
        private Long          parentId;
        private UserInfo      user;
        private LocalDateTime createdAt;
    }

    private MessageDto toDto(Commentaire c) {
        return MessageDto.builder()
                .id(c.getId())
                .contenu(c.getContenu())
                .pieceJointe(c.getPieceJointe())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .user(UserInfo.builder()
                        .id(c.getUser().getId())
                        .nom(c.getUser().getNom())
                        .prenom(c.getUser().getPrenom())
                        .role(c.getUser().getRole().name())
                        .build())
                .createdAt(c.getCreatedAt())
                .build();
    }

    // ─── GET messages ─────────────────────────────────────────────────────────

    @Operation(summary = "Lister les messages du forum d'un dossier")
    @GetMapping
    public ResponseEntity<List<MessageDto>> findAll(@PathVariable Long sinistreId,
                                                     Authentication auth) {
        verifierAccesForum(sinistreId, auth);
        List<MessageDto> msgs = commentaireRepository
                .findBySinistreIdOrderByCreatedAtAsc(sinistreId)
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(msgs);
    }

    // ─── POST message ─────────────────────────────────────────────────────────

    @Operation(summary = "Poster un message dans le forum")
    @PostMapping
    public ResponseEntity<MessageDto> create(@PathVariable Long sinistreId,
                                              @RequestBody CommentaireCreateRequest req,
                                              Authentication auth) {
        verifierAccesForum(sinistreId, auth);

        Sinistre sinistre = sinistreRepository.findById(sinistreId)
                .orElseThrow(() -> new ResourceNotFoundException("Sinistre", sinistreId));

        if (sinistre.getStatut().name().equals("CLOTURE"))
            throw new BusinessException("Le forum d'un dossier clôturé est en lecture seule.");

        if (req.getContenu() == null || req.getContenu().isBlank())
            throw new BusinessException("Le message ne peut pas être vide.");

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        Commentaire c = new Commentaire();
        c.setSinistre(sinistre);
        c.setUser(user);
        c.setContenu(req.getContenu().trim());
        c.setPieceJointe(req.getPieceJointe());

        if (req.getParentId() != null) {
            commentaireRepository.findById(req.getParentId()).ifPresent(c::setParent);
        }

        c = commentaireRepository.save(c);

        notifyForumParticipants(sinistre, user,
                user.getPrenom() + " " + user.getNom()
                + " a posté un message dans le dossier " + sinistre.getReference());

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(c));
    }

    // ─── PUT message ──────────────────────────────────────────────────────────

    @Operation(summary = "Modifier son propre message")
    @PutMapping("/{id}")
    public ResponseEntity<MessageDto> update(@PathVariable Long sinistreId,
                                              @PathVariable Long id,
                                              @RequestBody CommentaireCreateRequest req,
                                              Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Commentaire c = commentaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire", id));
        if (!c.getUser().getId().equals(user.getId()))
            throw new BusinessException("Vous pouvez uniquement modifier vos propres messages.");
        c.setContenu(req.getContenu());
        if (req.getPieceJointe() != null) c.setPieceJointe(req.getPieceJointe());
        return ResponseEntity.ok(toDto(commentaireRepository.save(c)));
    }

    // ─── DELETE message ───────────────────────────────────────────────────────

    @Operation(summary = "Supprimer son propre message")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long sinistreId,
                                        @PathVariable Long id,
                                        Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        Commentaire c = commentaireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire", id));
        boolean isOwner = c.getUser().getId().equals(user.getId());
        boolean isAdmin  = user.getRole().name().equals("GESTIONNAIRE")
                || user.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin)
            throw new BusinessException("Vous ne pouvez pas supprimer ce message.");
        commentaireRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void verifierAccesForum(Long sinistreId, Authentication auth) {
        Sinistre sinistre = sinistreRepository.findById(sinistreId)
                .orElseThrow(() -> new ResourceNotFoundException("Sinistre", sinistreId));
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        boolean isAdmin = user.getRole().name().equals("ADMIN")
                || user.getRole().name().equals("MANAGER")
                || user.getRole().name().equals("GESTIONNAIRE");
        boolean isClient = sinistre.getClient() != null
                && sinistre.getClient().getUser().getId().equals(user.getId());
        boolean isGarage = sinistre.getGarage() != null
                && sinistre.getGarage().getUser() != null
                && sinistre.getGarage().getUser().getId().equals(user.getId());
        boolean isGarageMission = missionRepository.findBySinistreId(sinistreId).stream()
            .anyMatch(m -> m.getGarage() != null
                && m.getGarage().getUser() != null
                && m.getGarage().getUser().getId().equals(user.getId()));
        boolean isExpert = sinistre.getExpert() != null
                && sinistre.getExpert().getUser() != null
                && sinistre.getExpert().getUser().getId().equals(user.getId());

        if (!isAdmin && !isClient && !isGarage && !isGarageMission && !isExpert)
            throw new BusinessException("Vous n'avez pas accès au forum de ce dossier.");
    }

    private void notifyForumParticipants(Sinistre sinistre, User auteur, String message) {
        List<User> participants = new ArrayList<>();
        if (sinistre.getClient() != null)
            participants.add(sinistre.getClient().getUser());
        if (sinistre.getGestionnaire() != null)
            participants.add(sinistre.getGestionnaire().getUser());
        if (sinistre.getGarage() != null && sinistre.getGarage().getUser() != null)
            participants.add(sinistre.getGarage().getUser());
        if (sinistre.getExpert() != null && sinistre.getExpert().getUser() != null)
            participants.add(sinistre.getExpert().getUser());

        for (User p : participants) {
            if (!p.getId().equals(auteur.getId())) {
                notificationService.envoyer(p, "Nouveau message", message,
                        TypeNotification.INFO, sinistre.getId());
            }
        }
    }
}
