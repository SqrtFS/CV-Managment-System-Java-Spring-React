package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.AttributeCategoryDto;
import com.kiyulex.cv.dto.AttributeDto;
import com.kiyulex.cv.entity.User;
import com.kiyulex.cv.repository.UserRepository;
import com.kiyulex.cv.service.AttributeService;
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
@RequestMapping("/attributes")
@RequiredArgsConstructor
public class AttributeController {

    private final AttributeService attributeService;
    private final UserRepository userRepository;

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PostMapping("/categories")
    public ResponseEntity<AttributeCategoryDto> createCategory(@Valid @RequestBody AttributeCategoryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attributeService.createCategory(dto));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/categories")
    public ResponseEntity<List<AttributeCategoryDto>> getAllCategories() {
        return ResponseEntity.ok(attributeService.getAllCategories());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PutMapping("/categories/{id}")
    public ResponseEntity<AttributeCategoryDto> updateCategory(
            @PathVariable("id") Long id, @Valid @RequestBody AttributeCategoryDto dto) {
        return ResponseEntity.ok(attributeService.updateCategory(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        attributeService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PostMapping
    public ResponseEntity<AttributeDto> createAttribute(@Valid @RequestBody AttributeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attributeService.createAttribute(dto));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<AttributeDto>> getAllAttributes() {
        return ResponseEntity.ok(attributeService.getAllAttributes());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<AttributeDto> getAttribute(@PathVariable Long id) {
        return ResponseEntity.ok(attributeService.getAttribute(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PutMapping("/{id}")
    public ResponseEntity<AttributeDto> updateAttribute(
            @PathVariable Long id, @Valid @RequestBody AttributeDto dto) {
        return ResponseEntity.ok(attributeService.updateAttribute(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttribute(@PathVariable Long id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/search")
    public ResponseEntity<List<AttributeDto>> searchAttributes(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String prefix) {
        return ResponseEntity.ok(attributeService.searchAttributes(categoryId, prefix));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/recently-used")
    public ResponseEntity<List<AttributeDto>> getRecentlyUsed(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.ok(attributeService.getRecentlyUsed(userId, limit));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}/mark-used")
    public ResponseEntity<Void> markUsed(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        attributeService.markUsed(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long resolveCurrentUserId(Authentication authentication) {
        String clerkId = authentication.getName();
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));
        return user.getId();
    }
}