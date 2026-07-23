package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessRuleDto {
    private Long id;
    private Long attributeId;
    private String attributeName;
    private String operator;
    private String value;
}