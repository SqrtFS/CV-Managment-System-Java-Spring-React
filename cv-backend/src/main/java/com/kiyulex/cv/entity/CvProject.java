package com.kiyulex.cv.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "cv_projects")
@IdClass(CvProjectId.class)
@Data
public class CvProject {
    @Id @ManyToOne @JoinColumn(name = "cv_id")
    private Cv cv;

    @Id @ManyToOne @JoinColumn(name = "project_id")
    private Project project;

    private Integer sortOrder;
}
