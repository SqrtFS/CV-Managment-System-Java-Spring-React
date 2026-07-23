package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.DiscussionPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionPostRepository extends JpaRepository<DiscussionPost, Long> {
    List<DiscussionPost> findByPositionIdOrderByCreatedAtAsc(Long positionId);
}