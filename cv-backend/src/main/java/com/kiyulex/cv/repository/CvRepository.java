package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.Cv;
import com.kiyulex.cv.entity.CvStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CvRepository extends JpaRepository<Cv, Long> {
    List<Cv> findByCandidateIdOrderByUpdatedAtDesc(Long candidateId);
    Optional<Cv> findByPositionIdAndCandidateId(Long positionId, Long candidateId);
    long countByCreatedAtAfter(Instant since);
    @Query("""
    SELECT DISTINCT c FROM Cv c
    JOIN c.candidate cand
    WHERE c.status = 'PUBLISHED'
      AND (LOWER(cand.firstName) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%'))
        OR LOWER(cand.lastName) LIKE LOWER(CONCAT('%', CAST(:query AS string), '%')))
    """)
    List<Cv> search(@Param("query") String query);
}