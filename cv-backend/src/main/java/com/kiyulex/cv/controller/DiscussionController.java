package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.DiscussionPostDto;
import com.kiyulex.cv.dto.DiscussionPostRequestDto;
import com.kiyulex.cv.entity.User;
import com.kiyulex.cv.repository.UserRepository;
import com.kiyulex.cv.service.DiscussionService;
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
@RequestMapping("/positions/{positionId}/discussion")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService discussionService;
    private final UserRepository userRepository;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<DiscussionPostDto>> list(@PathVariable Long positionId) {
        return ResponseEntity.ok(discussionService.listByPosition(positionId));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<DiscussionPostDto> post(
            @PathVariable Long positionId,
            @Valid @RequestBody DiscussionPostRequestDto request,
            Authentication authentication) {
        String clerkId = authentication.getName();
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));
        DiscussionPostDto dto = discussionService.post(positionId, user.getId(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}