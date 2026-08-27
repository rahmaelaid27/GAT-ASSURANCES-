package com.gat.assurances.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardAdminDto {
    private long totalUtilisateurs;
    private long totalClients;
    private long totalGarages;
    private long totalExperts;
    private long totalRemorqueurs;
    private long totalSinistres;
}
