package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TagCloudEntryDto {
    private String tagName;
    private long usageCount;
}