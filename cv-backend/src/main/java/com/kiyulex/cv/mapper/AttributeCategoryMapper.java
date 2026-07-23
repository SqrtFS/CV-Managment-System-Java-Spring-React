package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.AttributeCategoryDto;
import com.kiyulex.cv.entity.AttributeCategory;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttributeCategoryMapper {
    AttributeCategoryDto toDto(AttributeCategory entity);
    AttributeCategory toEntity(AttributeCategoryDto dto);
    List<AttributeCategoryDto> toDtoList(List<AttributeCategory> entities);
}