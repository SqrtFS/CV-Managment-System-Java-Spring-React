package com.kiyulex.cv.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessRulesRequest {

    private List<Item> rules;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        @NotNull(message = "attributeId is required")
        private Long attributeId;

        @NotNull(message = "operator is required")
        private String operator;

        @NotBlank(message = "value is required")
        private String value;
    }
}