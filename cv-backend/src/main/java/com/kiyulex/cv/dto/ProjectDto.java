package com.kiyulex.cv.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {

    private Long id;

    @NotBlank(message = "Project name is required")
    private String name;

    @NotNull(message = "Period start date is required")
    private LocalDate periodStart;

    private LocalDate periodEnd;

    private Long version;

    private String description;

    @Builder.Default
    private List<String> tags = new ArrayList<>();
}