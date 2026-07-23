    package com.kiyulex.cv.dto;

    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.time.LocalDate;
    import java.util.List;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class CvProjectDto {
        private Long projectId;
        private String name;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private String description;
        private List<String> tags;
        private Integer sortOrder;
    }