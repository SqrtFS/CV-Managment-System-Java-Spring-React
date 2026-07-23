package com.kiyulex.cv.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "profile_attribute_values",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "attribute_id"}))
@Data
public class ProfileAttributeValue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne @JoinColumn(name = "attribute_id")
    private Attribute attribute;

    @Column(columnDefinition = "TEXT")
    private String stringValue;
    private BigDecimal numericValue;
    private LocalDate dateValue;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Boolean booleanValue;

    @ManyToOne
    @JoinColumn(name = "option_id")
    private AttributeOption option;

    private String imageUrl;

    @Version
    private Long version;

    @UpdateTimestamp
    private Instant updatedAt;
}
