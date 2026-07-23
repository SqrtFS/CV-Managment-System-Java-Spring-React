package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.*;
import com.kiyulex.cv.entity.*;
import com.kiyulex.cv.exception.OptimisticLockConflictException;
import com.kiyulex.cv.mapper.PositionMapper;
import com.kiyulex.cv.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PositionService {

    private final PositionRepository positionRepository;
    private final PositionAttributeRepository positionAttributeRepository;
    private final AccessRuleRepository accessRuleRepository;
    private final AttributeRepository attributeRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final PositionMapper positionMapper;

    public List<PositionDto> getAll() {
        return positionMapper.toDtoList(positionRepository.findAll());
    }

    public Page<PositionDto> filter(String company, String level, int page, int size) {
        PositionLevel parsedLevel = parseLevel(level);
        Pageable pageable = PageRequest.of(page, size);

        Page<Position> result = (company == null && parsedLevel == null)
                ? positionRepository.findAll(pageable)
                : positionRepository.filter(company, parsedLevel, pageable);

        return result.map(positionMapper::toDto);
    }

    public PositionDto getById(Long id) {
        return positionMapper.toDto(getEntity(id));
    }

    public List<PositionDto> getLatest() {
        return positionMapper.toDtoList(positionRepository.findTop10ByOrderByUpdatedAtDesc());
    }

    @Transactional
    public PositionDto create(PositionRequestDto dto, Long createdByUserId) {
        Position position = new Position();
        position.setTitle(dto.getTitle());
        position.setShortDescription(dto.getShortDescription());
        position.setCompany(dto.getCompany());
        position.setLevel(parseLevel(dto.getLevel()));
        position.setPublic(dto.isPublic());
        position.setMaxProjects(dto.getMaxProjects() == null ? 3 : dto.getMaxProjects());
        position.setCreatedBy(userRepository.getReferenceById(createdByUserId));

        return positionMapper.toDto(positionRepository.save(position));
    }


    @Transactional
    public PositionDto duplicate(Long positionId, Long duplicatedByUserId) {
        Position original = getEntity(positionId);

        Position copy = new Position();
        copy.setTitle(original.getTitle() + " (copy)");
        copy.setShortDescription(original.getShortDescription());
        copy.setCompany(original.getCompany());
        copy.setLevel(original.getLevel());
        copy.setPublic(original.isPublic());
        copy.setMaxProjects(original.getMaxProjects());
        copy.setCreatedBy(userRepository.getReferenceById(duplicatedByUserId));
        copy.setRelevantProjectTags(new HashSet<>(original.getRelevantProjectTags()));
        copy = positionRepository.save(copy);

        for (PositionAttribute pa : positionAttributeRepository.findByPositionIdOrderBySortOrderAsc(positionId)) {
            PositionAttribute newPa = new PositionAttribute();
            newPa.setPosition(copy);
            newPa.setAttribute(pa.getAttribute());
            newPa.setSortOrder(pa.getSortOrder());
            newPa.setRequired(pa.isRequired());
            positionAttributeRepository.save(newPa);
        }

        for (AccessRule rule : accessRuleRepository.findByPositionId(positionId)) {
            AccessRule newRule = new AccessRule();
            newRule.setPosition(copy);
            newRule.setAttribute(rule.getAttribute());
            newRule.setOperator(rule.getOperator());
            newRule.setValue(rule.getValue());
            accessRuleRepository.save(newRule);
        }

        return positionMapper.toDto(copy);
    }

    @Transactional
    public PositionDto update(Long id, PositionRequestDto dto) {
        Position position = getEntity(id);

        if (!Objects.equals(position.getVersion(), dto.getVersion())) {
            throw new OptimisticLockConflictException(position.getVersion());
        }

        position.setTitle(dto.getTitle());
        position.setShortDescription(dto.getShortDescription());
        position.setCompany(dto.getCompany());
        position.setLevel(parseLevel(dto.getLevel()));
        position.setPublic(dto.isPublic());
        if (dto.getMaxProjects() != null) {
            position.setMaxProjects(dto.getMaxProjects());
        }

        return positionMapper.toDto(positionRepository.save(position));
    }

    @Transactional
    public void delete(Long id) {
        if (!positionRepository.existsById(id)) {
            throw new EntityNotFoundException("Position not found: " + id);
        }
        positionRepository.deleteById(id); // attributes/access rules cascade-delete (orphanRemoval on Position)
    }


    @Transactional
    public PositionDto setAttributes(Long positionId, PositionAttributesRequest request) {
        Position position = getEntity(positionId);
        positionAttributeRepository.deleteByPositionId(positionId);
        position.getAttributes().clear();

        int order = 0;
        for (PositionAttributesRequest.Item item : request.getAttributes()) {
            Attribute attribute = attributeRepository.findById(item.getAttributeId())
                    .orElseThrow(() -> new EntityNotFoundException("Attribute not found: " + item.getAttributeId()));

            PositionAttribute pa = new PositionAttribute();
            pa.setPosition(position);
            pa.setAttribute(attribute);
            pa.setSortOrder(order++);
            pa.setRequired(item.isRequired());
            position.getAttributes().add(positionAttributeRepository.save(pa));
        }

        return positionMapper.toDto(position);
    }

    @Transactional
    public PositionDto setAccessRules(Long positionId, AccessRulesRequest request) {
        Position position = getEntity(positionId);
        accessRuleRepository.deleteByPositionId(positionId);
        position.getAccessRules().clear();

        if (request.getRules() != null) {
            for (AccessRulesRequest.Item item : request.getRules()) {
                Attribute attribute = attributeRepository.findById(item.getAttributeId())
                        .orElseThrow(() -> new EntityNotFoundException("Attribute not found: " + item.getAttributeId()));

                AccessRule rule = new AccessRule();
                rule.setPosition(position);
                rule.setAttribute(attribute);
                rule.setOperator(RuleOperator.valueOf(item.getOperator()));
                rule.setValue(item.getValue());
                position.getAccessRules().add(accessRuleRepository.save(rule));
            }
        }

        return positionMapper.toDto(position);
    }

    @Transactional
    public PositionDto setProjectTags(Long positionId, ProjectTagsRequest request) {
        Position position = getEntity(positionId);
        position.setRelevantProjectTags(resolveTags(request.getTagNames()));
        return positionMapper.toDto(positionRepository.save(position));
    }

    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames == null) return tags;
        for (String rawName : tagNames) {
            String name = rawName.trim();
            if (name.isEmpty()) continue;
            Tag tag = tagRepository.findByNameIgnoreCase(name).orElseGet(() -> {
                Tag t = new Tag();
                t.setName(name);
                return tagRepository.save(t);
            });
            tags.add(tag);
        }
        return tags;
    }

    private Position getEntity(Long id) {
        return positionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Position not found: " + id));
    }

    private PositionLevel parseLevel(String level) {
        return (level == null || level.isBlank()) ? null : PositionLevel.valueOf(level.toUpperCase());
    }
    public List<PositionDto> getMostPopular() {
        return positionMapper.toDtoList(positionRepository.findTopByCvCount(PageRequest.of(0, 5)));
    }
}