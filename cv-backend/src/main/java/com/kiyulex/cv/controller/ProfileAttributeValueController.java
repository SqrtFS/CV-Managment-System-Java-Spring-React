package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.ProfileAttributeValueDto;
import com.kiyulex.cv.service.ProfileAttributeValueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profile-values")
@RequiredArgsConstructor
public class ProfileAttributeValueController {

    private final ProfileAttributeValueService valueService;


    @PreAuthorize("hasRole('ADMIN') or #clerkId == authentication.name")
    @GetMapping("/user/{clerkId}")
    public ResponseEntity<List<ProfileAttributeValueDto>> getUserValues(@PathVariable("clerkId") String clerkId) {
        return ResponseEntity.ok(valueService.getUserProfileValues(clerkId));
    }

    @PreAuthorize("hasRole('ADMIN') or #clerkId == authentication.name")
    @PostMapping("/user/{clerkId}")
    public ResponseEntity<ProfileAttributeValueDto> saveValue(
            @PathVariable("clerkId") String clerkId,
            @Valid @RequestBody ProfileAttributeValueDto dto) {
        return ResponseEntity.ok(valueService.saveOrUpdateValue(clerkId, dto));
    }

    @PreAuthorize("hasRole('ADMIN') or #clerkId == authentication.name")
    @DeleteMapping("/user/{clerkId}/attribute/{attributeId}")
    public ResponseEntity<Void> removeValue(
            @PathVariable("clerkId") String clerkId,
            @PathVariable("attributeId") Long attributeId) {
        valueService.removeValue(clerkId, attributeId);
        return ResponseEntity.noContent().build();
    }
}