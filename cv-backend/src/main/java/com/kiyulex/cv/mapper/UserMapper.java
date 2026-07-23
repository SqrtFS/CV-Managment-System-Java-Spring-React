package com.kiyulex.cv.mapper;

import com.kiyulex.cv.dto.UserRequestDto;
import com.kiyulex.cv.dto.UserResponseDto;
import com.kiyulex.cv.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProjectMapper.class, ProfileAttributeValueMapper.class})
public interface UserMapper {

    @Mapping(source = "role.name", target = "role")
    UserResponseDto toDto(User user);

    List<UserResponseDto> toDtoList(List<User> users);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "blocked", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "uiLanguage", ignore = true)
    @Mapping(target = "uiTheme", ignore = true)
    @Mapping(target = "projects", ignore = true)
    @Mapping(target = "attributeValues", ignore = true)
    User toEntity(UserRequestDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "clerkId", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "blocked", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "uiLanguage", ignore = true)
    @Mapping(target = "uiTheme", ignore = true)
    @Mapping(target = "projects", ignore = true)
    @Mapping(target = "attributeValues", ignore = true)
    void updateEntityFromDto(UserRequestDto dto, @MappingTarget User user);
}