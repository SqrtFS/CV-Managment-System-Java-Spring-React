package com.kiyulex.cv.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table (name = "access_rules")
@Data
public class AccessRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "position_id")
    private Position position;

    @ManyToOne @JoinColumn(name = "attribute_id")
    private Attribute attribute;

    @Enumerated(EnumType.STRING)
    private RuleOperator operator; // GT, GTE, LT, LTE, EQ, NEQ, IS_TRUE, IS_FALSE, IN

    private String value;
}
