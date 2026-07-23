package com.kiyulex.cv.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PositionAttributeId implements Serializable {
    private Long position;
    private Long attribute;
}
