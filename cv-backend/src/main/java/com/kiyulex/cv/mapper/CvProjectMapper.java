package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.CvProjectDto;
import com.kiyulex.cv.entity.CvProject;
import com.kiyulex.cv.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CvProjectMapper {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "project.name", target = "name")
    @Mapping(source = "project.periodStart", target = "periodStart")
    @Mapping(source = "project.periodEnd", target = "periodEnd")
    @Mapping(source = "project.description", target = "description")
    @Mapping(target = "tags", expression = "java(tagsToNames(entity.getProject().getTags()))")
    CvProjectDto toDto(CvProject entity);

    List<CvProjectDto> toDtoList(List<CvProject> entities);

    default List<String> tagsToNames(Set<Tag> tags) {
        if (tags == null) return List.of();
        return tags.stream().map(Tag::getName).collect(Collectors.toList());
    }
}