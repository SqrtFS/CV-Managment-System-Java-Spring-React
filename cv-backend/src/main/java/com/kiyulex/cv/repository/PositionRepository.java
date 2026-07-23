package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.Position;
import com.kiyulex.cv.entity.PositionLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PositionRepository extends JpaRepository<Position, Long> {

    List<Position> findTop10ByOrderByUpdatedAtDesc();

    @Query("""
    SELECT p FROM Position p
    WHERE (:company IS NULL OR LOWER(p.company) = LOWER(:company))
      AND (:level IS NULL OR p.level = :level)
    """)
    Page<Position> filter(@Param("company") String company, @Param("level") PositionLevel level, Pageable pageable);

    @Query("""
    SELECT p FROM Position p LEFT JOIN Cv c ON c.position = p
    GROUP BY p.id
    ORDER BY COUNT(c.id) DESC
    """)
    List<Position> findTopByCvCount(Pageable pageable);
    @Query("""
    SELECT p FROM Position p
    WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))
       OR LOWER(p.company) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))
    """)
    List<Position> search(@Param("query") String query);

}