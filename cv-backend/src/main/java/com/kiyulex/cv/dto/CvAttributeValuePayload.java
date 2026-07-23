package com.kiyulex.cv.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CvAttributeValuePayload(
        String stringValue,
        BigDecimal numericValue,
        LocalDate dateValue,
        LocalDate periodStart,
        LocalDate periodEnd,
        Boolean booleanValue,
        Long optionId,
        String imageUrl
) {}