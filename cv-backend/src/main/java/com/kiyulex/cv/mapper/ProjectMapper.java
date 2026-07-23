package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.ProjectDto;
import com.kiyulex.cv.entity.Project;
import com.kiyulex.cv.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(target = "tags", expression = "java(tagsToNames(entity.getTags()))")
    ProjectDto toDto(Project entity);

    List<ProjectDto> toDtoList(List<Project> entities);

    default List<String> tagsToNames(Set<Tag> tags) {
        if (tags == null) return List.of();
        return tags.stream().map(Tag::getName).collect(Collectors.toList());
    }
}