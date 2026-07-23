package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscussionPostDto {
    private Long id;
    private Long positionId;
    private Long authorId;
    private String authorFullName;
    private String content;
    private Instant createdAt;
}