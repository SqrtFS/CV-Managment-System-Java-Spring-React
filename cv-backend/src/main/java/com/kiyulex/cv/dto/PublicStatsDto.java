package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicStatsDto {
    private long cvsLast24h;
    private long totalPositions;
    private long totalCandidates;
    private long totalRecruiters;
    private long totalCvsSubmitted;
}