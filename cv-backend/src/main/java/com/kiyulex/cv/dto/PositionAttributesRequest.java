package com.kiyulex.cv.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PositionAttributesRequest {

    @NotEmpty(message = "Attribute list cannot be empty")
    private List<Item> attributes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        @NotNull(message = "attributeId is required")
        private Long attributeId;

        private boolean required;
    }
}