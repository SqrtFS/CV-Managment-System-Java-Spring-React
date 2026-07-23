package com.kiyulex.cv.dto;

import com.kiyulex.cv.entity.AttributeDataType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeDto {
    private Long id;

    @NotBlank(message = "Attribute name is required")
    private String name;

    @NotNull(message = "Data type is required")
    private AttributeDataType dataType;

    private Long version;

    private String description;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private List<AttributeOptionDto> options;
}