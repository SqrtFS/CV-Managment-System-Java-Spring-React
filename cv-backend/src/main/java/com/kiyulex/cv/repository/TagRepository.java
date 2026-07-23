package com.kiyulex.cv.repository;

import com.kiyulex.cv.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNameIgnoreCase(String name);
    @Query("SELECT t.name, COUNT(p.id) FROM Project p JOIN p.tags t GROUP BY t.name ORDER BY COUNT(p.id) DESC")
    List<Object[]> countProjectsByTag();
    List<Tag> findTop10ByNameStartingWithIgnoreCaseOrderByNameAsc(String prefix);

}