package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.*;
import com.kiyulex.cv.entity.CvStatus;
import com.kiyulex.cv.entity.User;
import com.kiyulex.cv.repository.UserRepository;
import com.kiyulex.cv.service.CvService;
import com.kiyulex.cv.service.LikeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cvs")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;
    private final LikeService likeService;
    private final UserRepository userRepository;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<CvDto>> listMine(Authentication authentication) {
        return ResponseEntity.ok(cvService.listByCandidate(resolveCurrentUserId(authentication)));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<CvDto> getById(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(cvService.getById(id, userId, isRecruiterOrAdmin(authentication)));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping
    public ResponseEntity<CvDto> create(@RequestParam Long positionId, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(cvService.create(positionId, userId));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{cvId}/attributes/{attributeId}")
    public ResponseEntity<CvDto> editAttributeValue(
            @PathVariable Long cvId, @PathVariable Long attributeId,
            @RequestBody CvAttributeValuePayload payload, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        boolean isAdmin = hasRole(authentication, "ADMIN");
        return ResponseEntity.ok(cvService.editAttributeValue(cvId, attributeId, payload, userId, isAdmin));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/projects")
    public ResponseEntity<CvDto> setProjects(
            @PathVariable Long id, @RequestBody CvProjectsRequest request, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        boolean isAdmin = hasRole(authentication, "ADMIN");
        return ResponseEntity.ok(cvService.setProjects(id, request.getProjectIds(), userId, isAdmin));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}/publish")
    public ResponseEntity<CvDto> publish(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        boolean isAdmin = hasRole(authentication, "ADMIN");
        return ResponseEntity.ok(cvService.publish(id, userId, isAdmin));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        boolean isAdmin = hasRole(authentication, "ADMIN");
        cvService.delete(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('RECRUITER')")
    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Long>> like(@PathVariable Long id, Authentication authentication) {
        long count = likeService.like(id, resolveCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("likesCount", count));
    }

    @PreAuthorize("hasRole('RECRUITER')")
    @DeleteMapping("/{id}/like")
    public ResponseEntity<Map<String, Long>> unlike(@PathVariable Long id, Authentication authentication) {
        long count = likeService.unlike(id, resolveCurrentUserId(authentication));
        return ResponseEntity.ok(Map.of("likesCount", count));
    }

    @PreAuthorize("hasRole('RECRUITER')")
    @GetMapping("/{positionId}/cvs")
    public ResponseEntity<List<CvDto>> getCvsByPosition(@PathVariable Long positionId) {
        List<CvDto> cvs = cvService.getCvsByPositionAndStatus(positionId, CvStatus.PUBLISHED);
        return ResponseEntity.ok(cvs);
    }

    private Long resolveCurrentUserId(Authentication authentication) {
        String clerkId = authentication.getName();
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));
        return user.getId();
    }

    private boolean isRecruiterOrAdmin(Authentication authentication) {
        return hasRole(authentication, "RECRUITER") || hasRole(authentication, "ADMIN");
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}