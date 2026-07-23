package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.AttributeOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeOptionRepository extends JpaRepository<AttributeOption, Long> {
    void deleteByAttributeId(Long attributeId);
}