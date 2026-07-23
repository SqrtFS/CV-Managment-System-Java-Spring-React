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
public class AttributeOptionDto {
    private Long id;

    @NotBlank(message = "Option value is required")
    private String value;

    private Integer sortOrder;
}