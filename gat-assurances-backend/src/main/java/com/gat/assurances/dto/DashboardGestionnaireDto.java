package com.gat.assurances.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardGestionnaireDto {
    private long dossiersActifs;
    private long dossiersAValider;
    private long dossiersUrgents;
    private double tauxResolution;
    private long notificationsNonLues;
    private List<SinistreDto> dossiersPrioritaires;
    private List<SinistreDto> dossiersRecents;
}
