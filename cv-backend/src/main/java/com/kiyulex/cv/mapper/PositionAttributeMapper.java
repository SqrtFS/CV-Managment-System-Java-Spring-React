package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.PositionAttributeDto;
import com.kiyulex.cv.entity.PositionAttribute;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PositionAttributeMapper {

    @Mapping(source = "attribute.id", target = "attributeId")
    @Mapping(source = "attribute.name", target = "attributeName")
    @Mapping(source = "attribute.dataType", target = "dataType")
    PositionAttributeDto toDto(PositionAttribute entity);

    List<PositionAttributeDto> toDtoList(List<PositionAttribute> entities);
}