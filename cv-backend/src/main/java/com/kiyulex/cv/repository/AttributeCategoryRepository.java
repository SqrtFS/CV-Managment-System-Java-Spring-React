package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.AttributeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttributeCategoryRepository  extends JpaRepository<AttributeCategory , Long> {
    boolean existsByName(String name);
}
