package com.kiyulex.cv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Long id;
    private String clerkId;
    private String email;
    private String firstName;
    private String lastName;
    private String location;
    private String photoUrl;

    private String role;
    private Long version;

    private Instant createdAt;
    private Instant updatedAt;
    private boolean blocked;

    private String uiLanguage;
    private String uiTheme;

    private List<ProjectDto> projects = new ArrayList<>();
    private List<ProfileAttributeValueDto> attributeValues = new ArrayList<>();
}