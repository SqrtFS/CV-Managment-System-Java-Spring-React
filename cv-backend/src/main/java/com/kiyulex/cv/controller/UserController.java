package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.UserRequestDto;
import com.kiyulex.cv.dto.UserResponseDto;
import com.kiyulex.cv.entity.RoleName;
import com.kiyulex.cv.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.groups.Default;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> getMe(Authentication authentication) {
        return ResponseEntity.ok(userService.getByClerkId(authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @Operation(description = "Get All Users")
    public ResponseEntity<List<UserResponseDto>> getAll(){
        return ResponseEntity.status(HttpStatus.OK).body(userService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(description = "Create User Manually")
    public ResponseEntity<UserResponseDto> registerProfile(@Validated(Default.class) @RequestBody UserRequestDto userRequestDto){
        UserResponseDto savedUser = userService.createUser(userRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{clerkId}")
    @PreAuthorize("#clerkId == authentication.name or hasRole('ADMIN')")
    @Operation(description ="Update User Profile")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable("clerkId") String clerkId,
            @Validated(Default.class) @RequestBody UserRequestDto userRequestDto) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.updateUser(clerkId, userRequestDto));
    }

    @DeleteMapping("/{clerkId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(description ="Delete User")
    public ResponseEntity<Void> deleteUser(@PathVariable("clerkId") String clerkId){
        userService.deleteUser(clerkId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{clerkId}/block")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(description = "Block a user")
    public ResponseEntity<UserResponseDto> blockUser(@PathVariable String clerkId) {
        return ResponseEntity.ok(userService.setBlocked(clerkId, true));
    }

    @PatchMapping("/{clerkId}/unblock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(description = "Unblock a user")
    public ResponseEntity<UserResponseDto> unblockUser(@PathVariable String clerkId) {
        return ResponseEntity.ok(userService.setBlocked(clerkId, false));
    }

    @PutMapping("/{clerkId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(description = "Change a user's role")
    public ResponseEntity<UserResponseDto> changeRole(
            @PathVariable String clerkId, @RequestParam RoleName role) {
        return ResponseEntity.ok(userService.changeRole(clerkId, role));
    }
}