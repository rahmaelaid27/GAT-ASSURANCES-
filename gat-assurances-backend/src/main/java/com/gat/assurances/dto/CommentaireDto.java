package com.gat.assurances.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentaireDto {
    private Long id;
    private String contenu;
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String userRole;
    private Long sinistreId;
    private Long parentId;
    private String pieceJointe;
    private LocalDateTime createdAt;
    @Builder.Default
    private List<CommentaireDto> replies = new ArrayList<>();
}
