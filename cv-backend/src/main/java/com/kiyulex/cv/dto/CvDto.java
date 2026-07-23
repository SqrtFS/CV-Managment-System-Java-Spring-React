package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvDto {
    private Long id;
    private Long positionId;
    private String positionTitle;
    private Long candidateId;
    private String candidateFullName;
    private String status;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
    private long likesCount;

    @Builder.Default
    private List<CvAttributeValueDto> attributeValues = new ArrayList<>();

    @Builder.Default
    private List<CvProjectDto> projects = new ArrayList<>();
}