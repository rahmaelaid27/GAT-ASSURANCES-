package com.gat.assurances.service;

import com.gat.assurances.dto.CommentaireCreateRequest;
import com.gat.assurances.dto.CommentaireDto;
import com.gat.assurances.entity.Commentaire;
import com.gat.assurances.entity.Sinistre;
import com.gat.assurances.entity.User;
import com.gat.assurances.entity.enums.TypeNotification;
import com.gat.assurances.entity.Notification;
import com.gat.assurances.repository.CommentaireRepository;
import com.gat.assurances.repository.NotificationRepository;
import com.gat.assurances.repository.SinistreRepository;
import com.gat.assurances.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final UserRepository userRepository;
    private final SinistreRepository sinistreRepository;
    private final NotificationRepository notificationRepository;

    public List<CommentaireDto> findBySinistre(Long sinistreId) {
        List<Commentaire> comments = commentaireRepository.findBySinistreIdOrderByCreatedAtAsc(sinistreId);
        return comments.stream()
                .filter(c -> c.getParent() == null)
                .map(this::toDtoWithReplies)
                .collect(Collectors.toList());
    }

    public List<CommentaireDto> findRecentGlobal() {
        List<Commentaire> latest = commentaireRepository.findTop10ByOrderByCreatedAtDesc();
        return latest.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public CommentaireDto create(CommentaireCreateRequest req, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        Sinistre sinistre = sinistreRepository.findById(req.getSinistreId())
                .orElseThrow(() -> new IllegalArgumentException("Sinistre introuvable"));

        Commentaire parent = null;
        if (req.getParentId() != null) {
            parent = commentaireRepository.findById(req.getParentId()).orElse(null);
        }

        Commentaire c = Commentaire.builder()
                .contenu(req.getContenu())
                .user(user)
                .sinistre(sinistre)
                .parent(parent)
                .pieceJointe(req.getPieceJointe())
                .build();

        Commentaire saved = commentaireRepository.save(c);

        // Detect mentions and create notifications
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("@([A-Za-z0-9_.+-]+@[A-Za-z0-9-]+\\.[A-Za-z0-9-.]+)");
        java.util.regex.Matcher m = p.matcher(c.getContenu());
        while (m.find()) {
            String mentionEmail = m.group(1);
            userRepository.findByEmail(mentionEmail).ifPresent(target -> {
                Notification notif = Notification.builder()
                        .titre("Vous avez été mentionné")
                        .message("Vous avez été mentionné dans un commentaire du sinistre " + sinistre.getReference())
                        .type(TypeNotification.INFO)
                        .lu(false)
                        .user(target)
                        .sinistreId(sinistre.getId())
                        .build();
                notificationRepository.save(notif);
            });
        }

        return toDto(saved);
    }

    @Transactional
    public CommentaireDto update(Long id, CommentaireCreateRequest req, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        Commentaire commentaire = commentaireRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Commentaire introuvable"));
        if (!commentaire.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Vous ne pouvez modifier que vos propres commentaires");
        }
        commentaire.setContenu(req.getContenu());
        if (req.getPieceJointe() != null) {
            commentaire.setPieceJointe(req.getPieceJointe());
        }
        Commentaire saved = commentaireRepository.save(commentaire);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id, Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        Commentaire commentaire = commentaireRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Commentaire introuvable"));
        if (!commentaire.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole().name())) {
            throw new IllegalArgumentException("Vous ne pouvez supprimer que vos propres commentaires");
        }
        commentaireRepository.delete(commentaire);
    }

    private CommentaireDto toDtoWithReplies(Commentaire c) {
        CommentaireDto dto = toDto(c);
        List<CommentaireDto> replies = c.getReponses().stream()
                .map(this::toDtoWithReplies)
                .collect(Collectors.toList());
        dto.setReplies(replies);
        return dto;
    }

    private CommentaireDto toDto(Commentaire c) {
        CommentaireDto.CommentaireDtoBuilder b = CommentaireDto.builder();
        b.id(c.getId())
                .contenu(c.getContenu())
                .sinistreId(c.getSinistre() != null ? c.getSinistre().getId() : null)
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .pieceJointe(c.getPieceJointe())
                .createdAt(c.getCreatedAt());
        if (c.getUser() != null) {
            b.userId(c.getUser().getId())
                .userNom(c.getUser().getNom())
                .userPrenom(c.getUser().getPrenom())
                .userRole(c.getUser().getRole() != null ? c.getUser().getRole().name() : null);
        }
        return b.build();
    }
}
