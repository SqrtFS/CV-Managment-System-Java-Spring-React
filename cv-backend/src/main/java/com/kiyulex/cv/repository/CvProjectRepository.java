package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.CvProject;
import com.kiyulex.cv.entity.CvProjectId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CvProjectRepository extends JpaRepository<CvProject, CvProjectId> {
    List<CvProject> findByCvIdOrderBySortOrderAsc(Long cvId);
    void deleteByCvId(Long cvId);
}