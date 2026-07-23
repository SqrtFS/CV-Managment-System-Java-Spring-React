package com.kiyulex.cv.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class UserRequestDto {

    @NotBlank(message = "clerkId is required")
    private String clerkId;

    @NotBlank(message = "Email is required !")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Name is required !")
    @Size(max = 100, message = "The name cannot contain more than 100 characters.")
    private String firstName;

    @NotBlank(message = "Last Name is required")
    private String lastName;

    private String location;

    private String photoUrl;

    private String uiLanguage = "en";

    private String uiTheme = "light";

}