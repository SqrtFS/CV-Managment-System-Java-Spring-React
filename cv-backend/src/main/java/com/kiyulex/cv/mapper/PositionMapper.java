package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.PositionDto;
import com.kiyulex.cv.entity.Position;
import com.kiyulex.cv.entity.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {PositionAttributeMapper.class, AccessRuleMapper.class})
public interface PositionMapper {

    @Mapping(source = "createdBy.id", target = "createdByUserId")
    @Mapping(source = "public", target = "isPublic")
    @Mapping(target = "relevantProjectTags", expression = "java(tagsToNames(entity.getRelevantProjectTags()))")
    PositionDto toDto(Position entity);

    List<PositionDto> toDtoList(List<Position> entities);

    default List<String> tagsToNames(Set<Tag> tags) {
        return tags.stream().map(Tag::getName).collect(Collectors.toList());
    }
}