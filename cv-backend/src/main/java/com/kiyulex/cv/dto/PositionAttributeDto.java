package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionAttributeDto {
    private Long attributeId;
    private String attributeName;
    private String dataType;
    private Integer sortOrder;
    private boolean required;
}