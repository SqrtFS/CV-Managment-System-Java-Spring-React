package com.kiyulex.cv.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "attribute_categories")
@Data
public class AttributeCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String name;
}
