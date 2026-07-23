package com.kiyulex.cv.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CvLikeId implements Serializable {
    private Long cv;
    private Long recruiter;
}
