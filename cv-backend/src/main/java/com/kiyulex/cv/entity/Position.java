package com.kiyulex.cv.entity;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Entity
@Table(name = "positions")
@Data
public class Position {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    private String company;

    @Enumerated(EnumType.STRING)
    private PositionLevel level;

    private boolean isPublic = true;
    private Integer maxProjects = 3;

    @ManyToOne @JoinColumn(name = "created_by")
    private User createdBy;

    @Version
    private Long version;

    @CreationTimestamp
    private Instant createdAt;
    @UpdateTimestamp
    private Instant updatedAt;

    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<PositionAttribute> attributes = new ArrayList<>();

    @OneToMany(mappedBy = "position", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccessRule> accessRules = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "position_project_tags",
            joinColumns = @JoinColumn(name = "position_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> relevantProjectTags = new HashSet<>();
}
