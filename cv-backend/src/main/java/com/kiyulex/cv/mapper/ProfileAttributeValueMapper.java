package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.ProfileAttributeValueDto;
import com.kiyulex.cv.entity.AttributeOption;
import com.kiyulex.cv.entity.ProfileAttributeValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProfileAttributeValueMapper {

    @Mapping(source = "attribute.id", target = "attributeId")
    @Mapping(source = "attribute.name", target = "attributeName")
    @Mapping(source = "attribute.dataType", target = "dataType")
    @Mapping(source = "option.id", target = "optionId")
    @Mapping(source = "option.value", target = "optionValue")
    ProfileAttributeValueDto toDto(ProfileAttributeValue entity);

    List<ProfileAttributeValueDto> toDtoList(List<ProfileAttributeValue> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "attribute", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "option", expression = "java(optionIdToOption(dto.getOptionId()))")
    ProfileAttributeValue toEntity(ProfileAttributeValueDto dto);

    default AttributeOption optionIdToOption(Long optionId) {
        if (optionId == null) return null;
        AttributeOption option = new AttributeOption();
        option.setId(optionId);
        return option;
    }
}