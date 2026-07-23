package com.kiyulex.cv.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Data
@Table(name = "recently_used_attributes")
@IdClass(RecentlyUsedAttributeId.class)
public class RecentlyUsedAttribute {

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "attribute_id")
    private Attribute attribute;

    private Instant usedAt;
}