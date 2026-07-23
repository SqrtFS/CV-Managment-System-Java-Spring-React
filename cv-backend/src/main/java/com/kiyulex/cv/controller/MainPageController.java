package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.PositionDto;
import com.kiyulex.cv.dto.PublicStatsDto;
import com.kiyulex.cv.dto.TagCloudEntryDto;
import com.kiyulex.cv.service.MainPageService;
import com.kiyulex.cv.service.PositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/main-page")
@RequiredArgsConstructor
public class MainPageController {

    private final MainPageService mainPageService;
    private final PositionService positionService;

    @GetMapping("/stats")
    public ResponseEntity<PublicStatsDto> getStats() {
        return ResponseEntity.ok(mainPageService.getPublicStats());
    }

    @GetMapping("/tag-cloud")
    public ResponseEntity<List<TagCloudEntryDto>> getTagCloud() {
        return ResponseEntity.ok(mainPageService.getTagCloud());
    }

    @GetMapping("/latest-positions")
    public ResponseEntity<List<PositionDto>> getLatestPositions() {
        return ResponseEntity.ok(positionService.getLatest());
    }

    @GetMapping("/popular-positions")
    public ResponseEntity<List<PositionDto>> getPopularPositions() {
        return ResponseEntity.ok(positionService.getMostPopular());
    }
}