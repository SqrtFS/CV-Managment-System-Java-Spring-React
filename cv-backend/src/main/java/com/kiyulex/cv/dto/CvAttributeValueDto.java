package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvAttributeValueDto {
    private Long attributeId;
    private String attributeName;
    private String dataType;
    private boolean required;

    private String stringValue;
    private BigDecimal numericValue;
    private LocalDate dateValue;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Boolean booleanValue;
    private Long optionId;
    private String optionValue;
    private String imageUrl;

    private boolean empty;
}