package com.kiyulex.cv.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeCategoryDto {
    private Long id;

    @NotBlank(message = "Category name is required")
    private String name;
}