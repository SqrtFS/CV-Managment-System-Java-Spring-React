package com.kiyulex.cv.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CvProjectId implements Serializable {
    private Long cv;
    private Long project;
}
