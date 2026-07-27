package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.CvAttributeValueDto;
import com.kiyulex.cv.entity.CvAttributeValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CvAttributeValueMapper {

    @Mapping(source = "attribute.id", target = "attributeId")
    @Mapping(source = "attribute.name", target = "attributeName")
    @Mapping(source = "attribute.dataType", target = "dataType")
    @Mapping(source = "attribute.options", target = "options")
    @Mapping(source = "option.id", target = "optionId")
    @Mapping(source = "option.value", target = "optionValue")
    @Mapping(target = "required", ignore = true)
    @Mapping(target = "empty", ignore = true)
    CvAttributeValueDto toDto(CvAttributeValue entity);

    List<CvAttributeValueDto> toDtoList(List<CvAttributeValue> entities);
}