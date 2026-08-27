package com.gat.assurances.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardManagerDto {
    private long totalSinistres;
    private long sinistresEnCours;
    private long sinistresClotures;
    private long sinistresRefuses;
    private double tauxResolutionGlobal;
    private long totalGarages;
    private long totalExperts;
    private long totalClients;
    private double delaiMoyenTraitement;
    private double satisfactionMoyenne;
}
