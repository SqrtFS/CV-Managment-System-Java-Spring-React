package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.*;
import com.kiyulex.cv.entity.User;
import com.kiyulex.cv.repository.UserRepository;
import com.kiyulex.cv.service.PositionAccessService;
import com.kiyulex.cv.service.PositionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;
    private final PositionAccessService positionAccessService;
    private final UserRepository userRepository;



    //  Public reads (guests can browse positions read-only)

    @GetMapping
    public ResponseEntity<Page<PositionDto>> getAll(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(positionService.filter(company, level, page, size));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<PositionDto>> getLatest() {
        return ResponseEntity.ok(positionService.getLatest());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PositionDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(positionService.getById(id));
    }

    //  Recruiter / Admin management (shared pool - no ownership concept)

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/all")
    public ResponseEntity<List<PositionDto>> getAllPositions(){
        return ResponseEntity.ok(positionService.getAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PostMapping
    public ResponseEntity<PositionDto> create(@Valid @RequestBody PositionRequestDto dto, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(positionService.create(dto, userId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<PositionDto> duplicate(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(positionService.duplicate(id, userId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PutMapping("/{id}")
    public ResponseEntity<PositionDto> update(@PathVariable Long id, @Valid @RequestBody PositionRequestDto dto) {
        return ResponseEntity.ok(positionService.update(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        positionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PutMapping("/{id}/attributes")
    public ResponseEntity<PositionDto> setAttributes(
            @PathVariable Long id, @Valid @RequestBody PositionAttributesRequest request) {
        return ResponseEntity.ok(positionService.setAttributes(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PutMapping("/{id}/access-rules")
    public ResponseEntity<PositionDto> setAccessRules(
            @PathVariable Long id, @RequestBody AccessRulesRequest request) {
        return ResponseEntity.ok(positionService.setAccessRules(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    @PutMapping("/{id}/project-tags")
    public ResponseEntity<PositionDto> setProjectTags(
            @PathVariable Long id, @RequestBody ProjectTagsRequest request) {
        return ResponseEntity.ok(positionService.setProjectTags(id, request));
    }

    //  Candidate: check own access to a restricted position ---------------
    /// ///////////

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/access-check")
    public ResponseEntity<Map<String, Boolean>> checkAccess(@PathVariable Long id, Authentication authentication) {
        Long userId = resolveCurrentUserId(authentication);
        boolean allowed = positionAccessService.canAccess(id, userId);
        return ResponseEntity.ok(Map.of("hasAccess", allowed));
    }

    private Long resolveCurrentUserId(Authentication authentication) {
        String clerkId = authentication.getName();
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));
        return user.getId();
    }
}