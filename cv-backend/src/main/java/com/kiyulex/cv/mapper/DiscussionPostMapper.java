package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.DiscussionPostDto;
import com.kiyulex.cv.entity.DiscussionPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DiscussionPostMapper {

    @Mapping(source = "position.id", target = "positionId")
    @Mapping(source = "author.id", target = "authorId")
    @Mapping(target = "authorFullName",
            expression = "java(entity.getAuthor().getFirstName() + \" \" + entity.getAuthor().getLastName())")
    DiscussionPostDto toDto(DiscussionPost entity);

    List<DiscussionPostDto> toDtoList(List<DiscussionPost> entities);
}