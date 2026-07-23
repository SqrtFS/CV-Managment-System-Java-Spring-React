package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.AccessRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccessRuleRepository extends JpaRepository<AccessRule, Long> {
    List<AccessRule> findByPositionId(Long positionId);
    void deleteByPositionId(Long positionId);
}