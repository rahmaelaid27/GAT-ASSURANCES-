package com.gat.assurances.controller;

import com.gat.assurances.entity.AuditLog;
import com.gat.assurances.entity.User;
import com.gat.assurances.entity.enums.Role;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.AuditLogRepository;
import com.gat.assurances.repository.GarageRepository;
import com.gat.assurances.repository.ExpertRepository;
import com.gat.assurances.repository.RemorqueurRepository;
import com.gat.assurances.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Administration", description = "Gestion des utilisateurs, partenaires et audit")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository       userRepository;
    private final GarageRepository     garageRepository;
    private final ExpertRepository     expertRepository;
    private final RemorqueurRepository remorqueurRepository;
    private final AuditLogRepository   auditLogRepository;

    // ─── DTOs ─────────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserDto {
        private Long   id;
        private String nom;
        private String prenom;
        private String email;
        private String cin;
        private String telephone;
        private String role;
        private boolean enabled;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PartenaireDto {
        private Long   id;
        private String type;   // GARAGE | EXPERT | REMORQUEUR
        private String nom;
        private String email;
        private String telephone;
        private String statut;
        private Double note;
        private String ville;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuditDto {
        private Long          id;
        private String        action;
        private String        details;
        private String        entity;
        private String        result;
        private LocalDateTime createdAt;
    }

    // ─── UTILISATEURS ─────────────────────────────────────────────────────────

    @Operation(summary = "Lister tous les utilisateurs")
    @GetMapping("/utilisateurs")
    public ResponseEntity<List<UserDto>> listUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .nom(u.getNom())
                        .prenom(u.getPrenom())
                        .email(u.getEmail())
                        .cin(u.getCin())
                        .telephone(u.getTelephone())
                        .role(u.getRole() != null ? u.getRole().name() : "")
                        .enabled(u.isEnabled())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Activer/désactiver un utilisateur")
    @PutMapping("/utilisateurs/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "id", id,
                "enabled", user.isEnabled(),
                "message", user.isEnabled() ? "Compte activé" : "Compte désactivé"
        ));
    }

    @Operation(summary = "Changer le rôle d'un utilisateur")
    @PutMapping("/utilisateurs/{id}/role")
    public ResponseEntity<Map<String, Object>> changeRole(@PathVariable Long id,
                                                           @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", id));
        user.setRole(Role.valueOf(role.toUpperCase()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("id", id, "role", role));
    }

    @Operation(summary = "Supprimer un utilisateur")
    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id))
            throw new ResourceNotFoundException("Utilisateur", id);
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── PARTENAIRES ──────────────────────────────────────────────────────────

    @Operation(summary = "Lister tous les partenaires (garages + experts + remorqueurs)")
    @GetMapping("/partenaires")
    public ResponseEntity<List<PartenaireDto>> listPartenaires() {
        List<PartenaireDto> result = new java.util.ArrayList<>();

        garageRepository.findAll().forEach(g -> result.add(PartenaireDto.builder()
                .id(g.getId())
                .type("GARAGE")
                .nom(g.getNom())
                .email(g.getEmail())
                .telephone(g.getTelephone())
                .statut(g.getStatut() != null ? g.getStatut().name() : "ACTIF")
                .note(g.getNote())
                .ville(g.getVille())
                .build()));

        expertRepository.findAll().forEach(e -> result.add(PartenaireDto.builder()
                .id(e.getId())
                .type("EXPERT")
                .nom(e.getNom() + " " + e.getPrenom())
                .email(e.getEmail())
                .telephone(e.getTelephone())
                .statut(e.getDisponibilite() ? "DISPONIBLE" : "INDISPONIBLE")
                .note(e.getNote())
                .ville(e.getZoneIntervention())
                .build()));

        remorqueurRepository.findAll().forEach(r -> result.add(PartenaireDto.builder()
                .id(r.getId())
                .type("REMORQUEUR")
                .nom(r.getNom() + " " + r.getPrenom())
                .email(r.getEmail())
                .telephone(r.getTelephone())
                .statut(r.getDisponibilite() ? "DISPONIBLE" : "INDISPONIBLE")
                .note(null)
                .ville(r.getLocalisation())
                .build()));

        return ResponseEntity.ok(result);
    }

    // ─── AUDIT ────────────────────────────────────────────────────────────────

    @Operation(summary = "Journal d'audit système")
    @GetMapping("/audit")
    public ResponseEntity<List<AuditDto>> listAudit() {
        List<AuditDto> logs = auditLogRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "date"))
                .stream()
                .map(a -> AuditDto.builder()
                        .id(a.getId())
                        .action(a.getAction())
                        .details(a.getDescription())
                        .entity(a.getTableConcernee())
                        .result(a.getResultat())
                        .createdAt(a.getDate())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }
}
