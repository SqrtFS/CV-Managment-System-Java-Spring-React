package com.kiyulex.cv.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    private String shortDescription;

    private String company;

    private String level;

    private boolean isPublic;

    @Min(value = 1, message = "maxProjects must be at least 1")
    private Integer maxProjects;

    private Long version;
}