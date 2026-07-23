package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.ProjectDto;
import com.kiyulex.cv.entity.User;
import com.kiyulex.cv.repository.UserRepository;
import com.kiyulex.cv.service.ProjectService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<ProjectDto>> listMine(Authentication authentication) {
        return ResponseEntity.ok(projectService.listByUser(resolveCurrentUserId(authentication)));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getById(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(projectService.getById(id, userId, hasRole(authentication, "ADMIN")));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody ProjectDto dto, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(userId, dto));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> update(
            @PathVariable Long id, @Valid @RequestBody ProjectDto dto, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(projectService.update(id, dto, userId, hasRole(authentication, "ADMIN")));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        projectService.delete(id, userId, hasRole(authentication, "ADMIN"));
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/tags/autocomplete")
    public ResponseEntity<List<String>> autocompleteTags(@RequestParam String prefix) {
        return ResponseEntity.ok(projectService.autocompleteTags(prefix));
    }

    private Long resolveCurrentUserId(Authentication authentication) {
        String clerkId = authentication.getName();
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));
        return user.getId();
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> ("ROLE_" + role).equals(a.getAuthority()));
    }
}