package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.AccessRuleDto;
import com.kiyulex.cv.entity.AccessRule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AccessRuleMapper {

    @Mapping(source = "attribute.id", target = "attributeId")
    @Mapping(source = "attribute.name", target = "attributeName")
    AccessRuleDto toDto(AccessRule entity);

    List<AccessRuleDto> toDtoList(List<AccessRule> entities);
}