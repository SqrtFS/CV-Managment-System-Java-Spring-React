package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.UserRequestDto;
import com.kiyulex.cv.dto.UserResponseDto;
import com.kiyulex.cv.entity.Role;
import com.kiyulex.cv.entity.RoleName;
import com.kiyulex.cv.entity.User;
import com.kiyulex.cv.exception.EmailExistsException;
import com.kiyulex.cv.exception.UserNotFoundException;
import com.kiyulex.cv.mapper.UserMapper;
import com.kiyulex.cv.repository.RoleRepository;
import com.kiyulex.cv.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    public List<UserResponseDto> getAll() {
        return userMapper.toDtoList(userRepository.findAll());
    }

    @Transactional
    public UserResponseDto createUser(UserRequestDto userDto) {
        try {
            User user = userMapper.toEntity(userDto);

            if (user.getRole() == null) {
                Role defaultRole = roleRepository.findByName(RoleName.CANDIDATE)
                        .orElseThrow(() -> new RuntimeException("Error: Role CANDIDATE not found in the database."));
                user.setRole(defaultRole);
            }

            User savedUser = userRepository.save(user);
            return userMapper.toDto(savedUser);
        } catch (DataIntegrityViolationException e) {
            throw new EmailExistsException("Profile with this email already exists: " + userDto.getEmail());
        }
    }

    @Transactional
    public UserResponseDto updateUser(String clerkId, UserRequestDto userDto) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new UserNotFoundException("User not found with clerkId: " + clerkId));

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setPhotoUrl(userDto.getPhotoUrl());
        user.setLocation(userDto.getLocation());

        user.setUiLanguage(userDto.getUiLanguage());
        user.setUiTheme(userDto.getUiTheme());

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional
    public void deleteUser(String clerkId) {
        long deleted = userRepository.deleteByClerkId(clerkId);
        if (deleted == 0) {
            throw new UsernameNotFoundException("User not found with clerkId: " + clerkId);
        }
    }

    public UserResponseDto getByClerkId(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + clerkId));
        return userMapper.toDto(user);
    }

    public Optional<User> getCurrentUser() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new UsernameNotFoundException("User not authenticated");
        }
        String clerkId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByClerkId(clerkId);
    }
    @Transactional
    public UserResponseDto setBlocked(String clerkId, boolean blocked) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new UserNotFoundException("User not found with clerkId: " + clerkId));
        user.setBlocked(blocked);
        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public UserResponseDto changeRole(String clerkId, RoleName roleName) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new UserNotFoundException("User not found with clerkId: " + clerkId));
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        user.setRole(role);
        return userMapper.toDto(userRepository.save(user));
    }


}