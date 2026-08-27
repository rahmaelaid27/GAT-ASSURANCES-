package com.gat.assurances.dto;

import com.gat.assurances.entity.enums.TypeNotification;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String titre;
    private String message;
    private TypeNotification type;
    private Long sinistreId;
    private Boolean lu;
    private LocalDateTime createdAt;
}
