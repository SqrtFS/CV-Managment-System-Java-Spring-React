package com.kiyulex.cv.entity;


import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "cv_likes")
@Data
@IdClass(CvLikeId.class)
public class CvLike {
    @Id @ManyToOne @JoinColumn(name = "cv_id")
    private Cv cv;

    @Id
    @ManyToOne
    @JoinColumn(name = "recruiter_id")
    private User recruiter;

    @CreationTimestamp
    private Instant createdAt;
}
