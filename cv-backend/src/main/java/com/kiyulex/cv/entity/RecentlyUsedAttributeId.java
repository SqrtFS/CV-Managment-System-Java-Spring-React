package com.kiyulex.cv.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentlyUsedAttributeId implements Serializable {
    private Long user;
    private Long attribute;
}