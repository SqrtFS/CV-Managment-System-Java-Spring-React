package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Long> {
    boolean existsByName(String name);

    @Query("""
    SELECT a FROM Attribute a
    WHERE (:categoryId IS NULL OR a.category.id = :categoryId)
      AND (:prefix = '' OR LOWER(a.name) LIKE LOWER(CONCAT(:prefix, '%')))
    ORDER BY a.name ASC
    """)
    List<Attribute> search(@Param("categoryId") Long categoryId, @Param("prefix") String prefix);
}