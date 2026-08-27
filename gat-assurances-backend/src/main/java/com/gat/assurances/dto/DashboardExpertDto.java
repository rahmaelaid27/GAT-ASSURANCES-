package com.gat.assurances.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardExpertDto {
    private long totalExpertisesMois;
    private long aPlanifier;
    private long rapportsDeposes;
    private double noteMoyenne;
    private long notificationsNonLues;
    private List<MissionDto> missionsRecentes;
}
