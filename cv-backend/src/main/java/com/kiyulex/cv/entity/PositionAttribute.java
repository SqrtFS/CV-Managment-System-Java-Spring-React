package com.kiyulex.cv.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "position_attributes")
@IdClass(PositionAttributeId.class)
public class PositionAttribute {
    @Id @ManyToOne @JoinColumn(name = "position_id")
    private Position position;

    @Id @ManyToOne @JoinColumn(name = "attribute_id")
    private Attribute attribute;

    private Integer sortOrder;
    private boolean required;
}
