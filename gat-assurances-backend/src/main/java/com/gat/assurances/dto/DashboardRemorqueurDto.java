package com.gat.assurances.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardRemorqueurDto {
    private long missionsCeMois;
    private long missionsTotal;
    private long missionsTerminees;
    private long demandesDisponibles;
    private int missionsEnCours;
    private boolean disponible;
    private long notificationsNonLues;
}
