package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.CvLike;
import com.kiyulex.cv.entity.CvLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CvLikeRepository extends JpaRepository<CvLike, CvLikeId> {
    long countByCvId(Long cvId);
    boolean existsByCvIdAndRecruiterId(Long cvId, Long recruiterId);
}