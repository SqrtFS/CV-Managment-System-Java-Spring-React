package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.CvDto;
import com.kiyulex.cv.entity.Cv;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {CvAttributeValueMapper.class, CvProjectMapper.class})
public interface CvMapper {

    @Mapping(source = "position.id", target = "positionId")
    @Mapping(source = "position.title", target = "positionTitle")
    @Mapping(source = "candidate.id", target = "candidateId")
    @Mapping(target = "candidateFullName",
            expression = "java(entity.getCandidate().getFirstName() + \" \" + entity.getCandidate().getLastName())")
    @Mapping(source = "cvProjects", target = "projects")
    @Mapping(target = "likesCount", ignore = true)
    CvDto toDto(Cv entity);

    List<CvDto> toDtoList(List<Cv> entities);
}