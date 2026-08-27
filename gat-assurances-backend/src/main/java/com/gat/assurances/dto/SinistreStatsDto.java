package com.gat.assurances.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SinistreStatsDto {
    private long total;
    private long declares;
    private long enCours;
    private long enExpertise;
    private long acceptes;
    private long refuses;
    private long rembourses;
    private long clotures;
}

