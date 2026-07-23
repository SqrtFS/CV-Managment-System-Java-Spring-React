package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.PositionAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PositionAttributeRepository extends JpaRepository<PositionAttribute, Long> {
    List<PositionAttribute> findByPositionIdOrderBySortOrderAsc(Long positionId);
    void deleteByPositionId(Long positionId);
}