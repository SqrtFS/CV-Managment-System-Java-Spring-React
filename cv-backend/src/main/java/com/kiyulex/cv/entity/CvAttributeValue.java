package com.kiyulex.cv.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;


@Entity
@Table(name = "cv_attribute_values", uniqueConstraints = @UniqueConstraint(columnNames = {"cv_id", "attribute_id"}))
@Data
public class CvAttributeValue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "cv_id")
    private Cv cv;

    @ManyToOne @JoinColumn(name = "attribute_id")
    private Attribute attribute;

    @Column(columnDefinition = "TEXT")
    private String stringValue;
    private BigDecimal numericValue;
    private LocalDate dateValue;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Boolean booleanValue;

    @ManyToOne @JoinColumn(name = "option_id")
    private AttributeOption option;

    private String imageUrl;
}
