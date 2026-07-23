package com.kiyulex.cv.service;

import com.kiyulex.cv.entity.CvLike;
import com.kiyulex.cv.entity.CvLikeId;
import com.kiyulex.cv.repository.CvLikeRepository;
import com.kiyulex.cv.repository.CvRepository;
import com.kiyulex.cv.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final CvLikeRepository cvLikeRepository;
    private final CvRepository cvRepository;
    private final UserRepository userRepository;

    @Transactional
    public long like(Long cvId, Long recruiterId) {
        if (!cvRepository.existsById(cvId)) {
            throw new EntityNotFoundException("CV not found: " + cvId);
        }
        CvLikeId id = new CvLikeId(cvId, recruiterId);
        if (!cvLikeRepository.existsById(id)) {
            CvLike like = new CvLike();
            like.setCv(cvRepository.getReferenceById(cvId));
            like.setRecruiter(userRepository.getReferenceById(recruiterId));
            cvLikeRepository.save(like);
        }
        return cvLikeRepository.countByCvId(cvId);
    }

    @Transactional
    public long unlike(Long cvId, Long recruiterId) {
        cvLikeRepository.deleteById(new CvLikeId(cvId, recruiterId));
        return cvLikeRepository.countByCvId(cvId);
    }
}