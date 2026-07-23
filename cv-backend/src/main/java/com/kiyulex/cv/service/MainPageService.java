package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.PublicStatsDto;
import com.kiyulex.cv.dto.TagCloudEntryDto;
import com.kiyulex.cv.entity.RoleName;
import com.kiyulex.cv.repository.CvRepository;
import com.kiyulex.cv.repository.PositionRepository;
import com.kiyulex.cv.repository.TagRepository;
import com.kiyulex.cv.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MainPageService {

    private final CvRepository cvRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    public PublicStatsDto getPublicStats() {
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        return PublicStatsDto.builder()
                .cvsLast24h(cvRepository.countByCreatedAtAfter(since))
                .totalPositions(positionRepository.count())
                .totalCandidates(userRepository.countByRoleName(RoleName.CANDIDATE))
                .totalRecruiters(userRepository.countByRoleName(RoleName.RECRUITER))
                .totalCvsSubmitted(cvRepository.count())
                .build();
    }

    public List<TagCloudEntryDto> getTagCloud() {
        return tagRepository.countProjectsByTag().stream()
                .map(row -> new TagCloudEntryDto((String) row[0], (Long) row[1]))
                .toList();
    }
}