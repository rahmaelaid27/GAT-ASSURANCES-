package com.gat.assurances.controller;

import com.gat.assurances.entity.Notification;
import com.gat.assurances.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Notifications", description = "Notifications Navbar uniquement")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NotificationDto {
        private Long id;
        private String titre;
        private String message;
        private String type;
        private Boolean lu;
        private Long sinistreId;
        private LocalDateTime createdAt;
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .titre(n.getTitre())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : "INFO")
                .lu(n.getLu())
                .sinistreId(n.getSinistreId())
                .createdAt(n.getCreatedAt())
                .build();
    }

    @Operation(summary = "Toutes mes notifications")
    @GetMapping
    public ResponseEntity<List<NotificationDto>> findAll(Authentication auth) {
        return ResponseEntity.ok(
            notificationService.findAll(auth).stream().map(this::toDto).collect(Collectors.toList())
        );
    }

    @Operation(summary = "Nombre de notifications non lues")
    @GetMapping("/count-unread")
    public ResponseEntity<Map<String, Long>> countUnread(Authentication auth) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(auth)));
    }

    @Operation(summary = "Marquer une notification comme lue")
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication auth) {
        notificationService.markAsRead(id, auth);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Marquer toutes les notifications comme lues")
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Supprimer les notifications lues")
    @DeleteMapping("/delete-read")
    public ResponseEntity<Void> deleteRead(Authentication auth) {
        notificationService.deleteRead(auth);
        return ResponseEntity.ok().build();
    }
}
