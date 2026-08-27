package com.gat.assurances.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentaireCreateRequest {
    private String contenu;
    private Long   sinistreId;   // optionnel — utilisé uniquement par CommentaireService
    private Long   parentId;
    private String pieceJointe;
}
