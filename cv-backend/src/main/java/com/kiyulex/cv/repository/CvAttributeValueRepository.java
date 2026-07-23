package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.CvAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CvAttributeValueRepository extends JpaRepository<CvAttributeValue, Long> {
    List<CvAttributeValue> findByCvId(Long cvId);
    Optional<CvAttributeValue> findByCvIdAndAttributeId(Long cvId, Long attributeId);
}