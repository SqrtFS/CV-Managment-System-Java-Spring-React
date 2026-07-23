package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserIdOrderByPeriodEndDesc(Long userId);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.tags t WHERE p.user.id = :userId AND t.id IN :tagIds")
    List<Project> findByUserIdAndTagIds(@Param("userId") Long userId, @Param("tagIds") List<Long> tagIds);
}