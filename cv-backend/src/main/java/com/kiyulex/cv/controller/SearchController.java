package com.kiyulex.cv.controller;

import com.kiyulex.cv.dto.CvDto;
import com.kiyulex.cv.dto.PositionDto;
import com.kiyulex.cv.mapper.CvMapper;
import com.kiyulex.cv.mapper.PositionMapper;
import com.kiyulex.cv.repository.CvRepository;
import com.kiyulex.cv.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final PositionRepository positionRepository;
    private final CvRepository cvRepository;
    private final PositionMapper positionMapper;
    private final CvMapper cvMapper;

    @GetMapping("/positions")
    public ResponseEntity<List<PositionDto>> searchPositions(@RequestParam String q) {
        return ResponseEntity.ok(positionMapper.toDtoList(positionRepository.search(q)));
    }

    @GetMapping("/cvs")
    public ResponseEntity<List<CvDto>> searchCvs(@RequestParam String q) {
        return ResponseEntity.ok(cvMapper.toDtoList(cvRepository.search(q)));
    }
}