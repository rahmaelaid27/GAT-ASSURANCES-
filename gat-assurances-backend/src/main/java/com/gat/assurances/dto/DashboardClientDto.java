package com.gat.assurances.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardClientDto {
    private long totalDossiers;
    private long dossiersEnCours;
    private long dossiersClotures;
    private long totalVehicules;
    private long notificationsNonLues;
    private List<SinistreDto> sinistresEnCours;
    private List<SinistreDto> sinistresRecents;
}
