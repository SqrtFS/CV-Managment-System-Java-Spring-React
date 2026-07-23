package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.RecentlyUsedAttribute;
import com.kiyulex.cv.entity.RecentlyUsedAttributeId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecentlyUsedAttributeRepository extends JpaRepository<RecentlyUsedAttribute, RecentlyUsedAttributeId> {

    @Query("SELECT r FROM RecentlyUsedAttribute r WHERE r.user.id = :userId ORDER BY r.usedAt DESC")
    List<RecentlyUsedAttribute> findRecentByUser(@Param("userId") Long userId, Pageable pageable);
}