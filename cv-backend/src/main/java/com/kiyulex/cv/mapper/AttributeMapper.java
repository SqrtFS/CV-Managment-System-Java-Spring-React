package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.AttributeDto;
import com.kiyulex.cv.entity.Attribute;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttributeMapper {

    @Mapping(source = "category.id", target = "categoryId")
    AttributeDto toDto(Attribute entity);

    @Mapping(source = "categoryId", target = "category.id")
    Attribute toEntity(AttributeDto dto);

    List<AttributeDto> toDtoList(List<Attribute> entities);
}