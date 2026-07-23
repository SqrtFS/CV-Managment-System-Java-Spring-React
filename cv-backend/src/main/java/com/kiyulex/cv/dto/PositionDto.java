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
public class PositionDto {
    private Long id;
    private String title;
    private String shortDescription;
    private String company;
    private String level;
    private boolean isPublic;
    private Integer maxProjects;
    private Long createdByUserId;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;

    @Builder.Default
    private List<PositionAttributeDto> attributes = new ArrayList<>();

    @Builder.Default
    private List<AccessRuleDto> accessRules = new ArrayList<>();

    @Builder.Default
    private List<String> relevantProjectTags = new ArrayList<>();
}