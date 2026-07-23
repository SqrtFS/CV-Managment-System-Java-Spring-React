package com.kiyulex.cv.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "attributes")
@Data
public class Attribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne @JoinColumn(name = "category_id", nullable = false)
    private AttributeCategory category;

    @Enumerated(EnumType.STRING)
    private AttributeDataType dataType; // STRING, TEXT, IMAGE, NUMERIC, DATE, PERIOD, BOOLEAN, ENUM

    @ManyToOne @JoinColumn(name = "created_by")
    private User createdBy;
    @Version
    private Long version;

    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<AttributeOption> options = new ArrayList<>();
}
