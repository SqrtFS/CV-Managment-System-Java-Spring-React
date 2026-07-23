package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.ProfileAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfileAttributeValueRepository extends JpaRepository<ProfileAttributeValue, Long> {

    List<ProfileAttributeValue> findByUserId(Long userId);

    Optional<ProfileAttributeValue> findByUserIdAndAttributeId(Long userId, Long attributeId);

    void deleteByUserIdAndAttributeId(Long userId, Long attributeId);
}