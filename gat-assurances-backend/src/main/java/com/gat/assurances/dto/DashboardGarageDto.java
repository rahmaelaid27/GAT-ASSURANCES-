package com.gat.assurances.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardGarageDto {
    private long missionsActives;
    private long missionsEnCours;
    private long devisEnAttente;
    private double noteMoyenne;
    private long notificationsNonLues;
    private List<MissionDto> missionsActives_list;
    private List<MissionDto> missionsAujourdhui;
}
