package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.AttributeCategoryDto;
import com.kiyulex.cv.dto.AttributeDto;
import com.kiyulex.cv.entity.Attribute;
import com.kiyulex.cv.entity.AttributeCategory;
import com.kiyulex.cv.entity.AttributeOption;
import com.kiyulex.cv.entity.RecentlyUsedAttribute;
import com.kiyulex.cv.entity.RecentlyUsedAttributeId;
import com.kiyulex.cv.exception.OptimisticLockConflictException;
import com.kiyulex.cv.mapper.AttributeCategoryMapper;
import com.kiyulex.cv.mapper.AttributeMapper;
import com.kiyulex.cv.repository.AttributeCategoryRepository;
import com.kiyulex.cv.repository.AttributeOptionRepository;
import com.kiyulex.cv.repository.AttributeRepository;
import com.kiyulex.cv.repository.RecentlyUsedAttributeRepository;
import com.kiyulex.cv.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeCategoryRepository categoryRepository;
    private final AttributeOptionRepository optionRepository;
    private final RecentlyUsedAttributeRepository recentlyUsedRepository;
    private final UserRepository userRepository;
    private final AttributeMapper attributeMapper;
    private final AttributeCategoryMapper categoryMapper;

    @Transactional
    public AttributeCategoryDto createCategory(AttributeCategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Category with name '" + dto.getName() + "' already exists");
        }
        AttributeCategory category = categoryMapper.toEntity(dto);
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    public List<AttributeCategoryDto> getAllCategories() {
        return categoryMapper.toDtoList(categoryRepository.findAll());
    }

    @Transactional
    public AttributeCategoryDto updateCategory(Long id, AttributeCategoryDto dto) {
        AttributeCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
        category.setName(dto.getName());
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }

    @Transactional
    public AttributeDto createAttribute(AttributeDto dto) {
        if (attributeRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Attribute with name '" + dto.getName() + "' already exists");
        }

        AttributeCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + dto.getCategoryId()));

        Attribute attribute = attributeMapper.toEntity(dto);
        attribute.setCategory(category);

        if (attribute.getOptions() != null) {
            attribute.getOptions().forEach(option -> option.setAttribute(attribute));
        }

        Attribute savedAttribute = attributeRepository.save(attribute);
        return attributeMapper.toDto(savedAttribute);
    }

    public List<AttributeDto> getAllAttributes() {
        return attributeMapper.toDtoList(attributeRepository.findAll());
    }

    public AttributeDto getAttribute(Long id) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attribute not found: " + id));
        return attributeMapper.toDto(attribute);
    }

    @Transactional
    public AttributeDto updateAttribute(Long id, AttributeDto dto) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attribute is not found : " + id));

        if (!Objects.equals(attribute.getVersion(), dto.getVersion())) {
            throw new OptimisticLockConflictException(attribute.getVersion());
        }

        attribute.setDescription(dto.getDescription());

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(attribute.getCategory().getId())) {
            AttributeCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + dto.getCategoryId()));
            attribute.setCategory(category);
        }

        replaceOptions(attribute, dto);

        return attributeMapper.toDto(attributeRepository.save(attribute));
    }

    @Transactional
    public void deleteAttribute(Long id) {
        if (!attributeRepository.existsById(id)) {
            throw new EntityNotFoundException("Attribute not found: " + id);
        }
        attributeRepository.deleteById(id);
    }

    public List<AttributeDto> searchAttributes(Long categoryId, String prefix) {
        String normalizedPrefix = (prefix == null || prefix.isBlank()) ? null : prefix.trim();
        return attributeMapper.toDtoList(attributeRepository.search(categoryId, normalizedPrefix));
    }

    @Transactional
    public void markUsed(Long userId, Long attributeId) {
        RecentlyUsedAttributeId id = new RecentlyUsedAttributeId(userId, attributeId);
        try {
            RecentlyUsedAttribute usage = recentlyUsedRepository.findById(id).orElseGet(() -> {
                RecentlyUsedAttribute u = new RecentlyUsedAttribute();
                u.setUser(userRepository.getReferenceById(userId));
                u.setAttribute(attributeRepository.getReferenceById(attributeId));
                return u;
            });
            usage.setUsedAt(Instant.now());
            recentlyUsedRepository.save(usage);
        } catch (DataIntegrityViolationException e) {
            recentlyUsedRepository.findById(id).ifPresent(u -> {
                u.setUsedAt(Instant.now());
                recentlyUsedRepository.save(u);
            });
        }
    }

    public List<AttributeDto> getRecentlyUsed(Long userId, int limit) {
        List<Attribute> attributes = recentlyUsedRepository.findRecentByUser(userId, PageRequest.of(0, limit))
                .stream().map(RecentlyUsedAttribute::getAttribute).toList();
        return attributeMapper.toDtoList(attributes);
    }

    private void replaceOptions(Attribute attribute, AttributeDto dto) {
        if (dto.getOptions() == null) {
            return;
        }
        optionRepository.deleteByAttributeId(attribute.getId());
        attribute.getOptions().clear();

        Attribute mappedTemp = attributeMapper.toEntity(dto);
        List<AttributeOption> newOptions = mappedTemp.getOptions();
        if (newOptions != null) {
            int order = 0;
            for (AttributeOption option : newOptions) {
                option.setAttribute(attribute);
                option.setSortOrder(order++);
                attribute.getOptions().add(optionRepository.save(option));
            }
        }
    }
}