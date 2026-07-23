package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.ProfileAttributeValueDto;
import com.kiyulex.cv.entity.*;
import com.kiyulex.cv.exception.OptimisticLockConflictException;
import com.kiyulex.cv.mapper.ProfileAttributeValueMapper;
import com.kiyulex.cv.repository.AttributeRepository;
import com.kiyulex.cv.repository.ProfileAttributeValueRepository;
import com.kiyulex.cv.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileAttributeValueService {

    private final ProfileAttributeValueRepository valueRepository;
    private final AttributeRepository attributeRepository;
    private final UserRepository userRepository;
    private final ProfileAttributeValueMapper valueMapper;

    public List<ProfileAttributeValueDto> getUserProfileValues(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));

        List<ProfileAttributeValue> values = valueRepository.findByUserId(user.getId());
        return valueMapper.toDtoList(values);
    }

    @Transactional
    public ProfileAttributeValueDto saveOrUpdateValue(String clerkId, ProfileAttributeValueDto dto) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));

        Attribute attribute = attributeRepository.findById(dto.getAttributeId())
                .orElseThrow(() -> new EntityNotFoundException("Attribute not found: " + dto.getAttributeId()));

        ProfileAttributeValue existingValue = valueRepository.findByUserIdAndAttributeId(user.getId(), attribute.getId())
                .orElseGet(() -> {
                    ProfileAttributeValue v = new ProfileAttributeValue();
                    v.setUser(user);
                    v.setAttribute(attribute);
                    return v;
                });

        if (existingValue.getId() != null
                && dto.getVersion() != null
                && !Objects.equals(existingValue.getVersion(), dto.getVersion())) {
            throw new OptimisticLockConflictException(existingValue.getVersion());
        }

        ProfileAttributeValue newValue = valueMapper.toEntity(dto);
        validateAndSetValues(existingValue, newValue, attribute);

        ProfileAttributeValue savedValue = valueRepository.save(existingValue);
        return valueMapper.toDto(savedValue);
    }

    @Transactional
    public void removeValue(String clerkId, Long attributeId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + clerkId));
        valueRepository.deleteByUserIdAndAttributeId(user.getId(), attributeId);
    }

    private void validateAndSetValues(ProfileAttributeValue target, ProfileAttributeValue source, Attribute attribute) {
        target.setStringValue(null);
        target.setNumericValue(null);
        target.setDateValue(null);
        target.setPeriodStart(null);
        target.setPeriodEnd(null);
        target.setBooleanValue(null);
        target.setOption(null);
        target.setImageUrl(null);

        switch (attribute.getDataType()) {
            case STRING, TEXT -> {
                if (source.getStringValue() == null) throw new IllegalArgumentException("String value is required");
                target.setStringValue(source.getStringValue());
            }
            case NUMERIC -> {
                if (source.getNumericValue() == null) throw new IllegalArgumentException("Numeric value is required");
                target.setNumericValue(source.getNumericValue());
            }
            case DATE -> {
                if (source.getDateValue() == null) throw new IllegalArgumentException("Date value is required");
                target.setDateValue(source.getDateValue());
            }
            case PERIOD -> {
                if (source.getPeriodStart() == null) throw new IllegalArgumentException("Period start is required");
                target.setPeriodStart(source.getPeriodStart());
                target.setPeriodEnd(source.getPeriodEnd());
            }
            case BOOLEAN -> {
                if (source.getBooleanValue() == null) throw new IllegalArgumentException("Boolean value is required");
                target.setBooleanValue(source.getBooleanValue());
            }
            case ENUM -> {
                if (source.getOption() == null || source.getOption().getId() == null) {
                    throw new IllegalArgumentException("Option is required for ENUM type");
                }
                boolean validOption = attribute.getOptions().stream()
                        .anyMatch(opt -> opt.getId().equals(source.getOption().getId()));
                if (!validOption) {
                    throw new IllegalArgumentException("Invalid option for this attribute");
                }
                target.setOption(source.getOption());
            }
            case IMAGE -> {
                if (source.getImageUrl() == null) throw new IllegalArgumentException("Image URL is required");
                target.setImageUrl(source.getImageUrl());
            }
        }
    }
}