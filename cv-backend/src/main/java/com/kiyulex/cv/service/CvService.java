package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.CvAttributeValueDto;
import com.kiyulex.cv.dto.CvAttributeValuePayload;
import com.kiyulex.cv.dto.CvDto;
import com.kiyulex.cv.entity.*;
import com.kiyulex.cv.mapper.CvMapper;
import com.kiyulex.cv.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CvService {

    private final CvRepository cvRepository;
    private final CvAttributeValueRepository cvAttributeValueRepository;
    private final CvProjectRepository cvProjectRepository;
    private final CvLikeRepository cvLikeRepository;
    private final PositionRepository positionRepository;
    private final PositionAttributeRepository positionAttributeRepository;
    private final ProfileAttributeValueRepository profileAttributeValueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AttributeOptionRepository optionRepository;
    private final PositionAccessService positionAccessService;
    private final CvMapper cvMapper;

    public List<CvDto> listByCandidate(Long candidateId) {
        return cvRepository.findByCandidateIdOrderByUpdatedAtDesc(candidateId)
                .stream().map(this::toEnrichedDto).collect(Collectors.toList());
    }


    public CvDto getById(Long id, Long requestingUserId, boolean isRecruiterOrAdmin) {
        Cv cv = getEntity(id);
        if (!isRecruiterOrAdmin && !cv.getCandidate().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("You can only view your own CV");
        }
        return toEnrichedDto(cv);
    }

    @Transactional
    public CvDto create(Long positionId, Long candidateId) {
        Position position = positionRepository.findById(positionId)
                .orElseThrow(() -> new EntityNotFoundException("Position not found: " + positionId));

        if (!positionAccessService.canAccess(positionId, candidateId)) {
            throw new AccessDeniedException("Candidate does not have access to this position");
        }
        if (cvRepository.findByPositionIdAndCandidateId(positionId, candidateId).isPresent()) {
            throw new IllegalStateException("A CV for this position already exists for this candidate");
        }

        Cv cv = new Cv();
        cv.setPosition(position);
        cv.setCandidate(userRepository.getReferenceById(candidateId));
        cv.setStatus(CvStatus.DRAFT);
        cv = cvRepository.save(cv);

        for (PositionAttribute pa : positionAttributeRepository.findByPositionIdOrderBySortOrderAsc(positionId)) {
            CvAttributeValue cvValue = new CvAttributeValue();
            cvValue.setCv(cv);
            cvValue.setAttribute(pa.getAttribute());

            profileAttributeValueRepository.findByUserIdAndAttributeId(candidateId, pa.getAttribute().getId())
                    .ifPresent(profileValue -> copyValue(profileValue, cvValue));

            cvAttributeValueRepository.save(cvValue);
        }

        List<Long> tagIds = position.getRelevantProjectTags().stream().map(Tag::getId).toList();
        List<Project> candidateProjects = tagIds.isEmpty()
                ? List.of()
                : projectRepository.findByUserIdAndTagIds(candidateId, tagIds);

        int limit = position.getMaxProjects() == null ? Integer.MAX_VALUE : position.getMaxProjects();
        int order = 0;
        for (Project project : candidateProjects) {
            if (order >= limit) break;
            CvProject cvProject = new CvProject();
            cvProject.setCv(cv);
            cvProject.setProject(project);
            cvProject.setSortOrder(order++);
            cvProjectRepository.save(cvProject);
        }

        return toEnrichedDto(cv);
    }
    @Transactional
    public CvDto editAttributeValue(Long cvId, Long attributeId, CvAttributeValuePayload payload,
                                    Long requestingUserId, boolean isAdmin) {
        Cv cv = getEntity(cvId);
        assertOwnerOrAdmin(cv, requestingUserId, isAdmin);

        CvAttributeValue cvValue = cvAttributeValueRepository.findByCvIdAndAttributeId(cvId, attributeId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "This attribute is not part of the position template for this CV: " + attributeId));

        applyPayload(cvValue, payload);
        cvAttributeValueRepository.save(cvValue);

        ProfileAttributeValue profileValue = profileAttributeValueRepository
                .findByUserIdAndAttributeId(cv.getCandidate().getId(), attributeId)
                .orElseGet(() -> {
                    ProfileAttributeValue v = new ProfileAttributeValue();
                    v.setUser(cv.getCandidate());
                    v.setAttribute(cvValue.getAttribute());
                    return v;
                });
        applyPayload(profileValue, payload);
        profileAttributeValueRepository.save(profileValue);

        return toEnrichedDto(cv);
    }

    @Transactional
    public CvDto setProjects(Long cvId, List<Long> projectIdsInOrder, Long requestingUserId, boolean isAdmin) {
        Cv cv = getEntity(cvId);
        assertOwnerOrAdmin(cv, requestingUserId, isAdmin);

        int limit = cv.getPosition().getMaxProjects() == null ? Integer.MAX_VALUE : cv.getPosition().getMaxProjects();
        if (projectIdsInOrder.size() > limit) {
            throw new IllegalArgumentException("Maximum number of projects for this position exceeded: " + limit);
        }

        cvProjectRepository.deleteByCvId(cvId);
        cv.getCvProjects().clear();

        int order = 0;
        for (Long projectId : projectIdsInOrder) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
            CvProject cvProject = new CvProject();
            cvProject.setCv(cv);
            cvProject.setProject(project);
            cvProject.setSortOrder(order++);
            cv.getCvProjects().add(cvProjectRepository.save(cvProject));
        }

        return toEnrichedDto(cv);
    }

    @Transactional
    public CvDto publish(Long cvId, Long requestingUserId, boolean isAdmin) {
        Cv cv = getEntity(cvId);
        assertOwnerOrAdmin(cv, requestingUserId, isAdmin);

        List<PositionAttribute> requiredAttrs = positionAttributeRepository
                .findByPositionIdOrderBySortOrderAsc(cv.getPosition().getId())
                .stream().filter(PositionAttribute::isRequired).toList();

        List<CvAttributeValue> values = cvAttributeValueRepository.findByCvId(cvId);

        for (PositionAttribute required : requiredAttrs) {
            boolean filled = values.stream()
                    .filter(v -> v.getAttribute().getId().equals(required.getAttribute().getId()))
                    .anyMatch(this::isFilled);
            if (!filled) {
                throw new IllegalStateException(
                        "Required attribute is not filled in: " + required.getAttribute().getName());
            }
        }

        cv.setStatus(CvStatus.PUBLISHED);
        cvRepository.save(cv);
        return toEnrichedDto(cv);
    }

    @Transactional
    public void delete(Long cvId, Long requestingUserId, boolean isAdmin) {
        Cv cv = getEntity(cvId);
        assertOwnerOrAdmin(cv, requestingUserId, isAdmin);
        cvRepository.delete(cv);
    }

    public List<CvDto> getCvsByPositionAndStatus(Long positionId, CvStatus status) {
        List<Cv> cvs = cvRepository.findAllByPositionIdAndStatus(positionId, status);

        return cvs.stream().map(cv -> {
            CvDto dto = new CvDto();
            dto.setId(cv.getId());
            dto.setCandidateFullName(cv.getCandidate().getFirstName() + " " + cv.getCandidate().getLastName());
            dto.setStatus(cv.getStatus().name());
            dto.setLikesCount(cv.getLikes().size());
            return dto;
        }).collect(Collectors.toList());
    }

    // ---------- helpers ----------

    private Cv getEntity(Long id) {
        return cvRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CV not found: " + id));
    }

    private void assertOwnerOrAdmin(Cv cv, Long requestingUserId, boolean isAdmin) {
        if (isAdmin) return;
        if (!cv.getCandidate().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("You can only modify your own CV");
        }
    }

    private boolean isFilled(CvAttributeValue v) {
        return v.getStringValue() != null || v.getNumericValue() != null || v.getDateValue() != null
                || v.getPeriodStart() != null || v.getBooleanValue() != null || v.getOption() != null
                || v.getImageUrl() != null;
    }

    private void copyValue(ProfileAttributeValue src, CvAttributeValue dst) {
        dst.setStringValue(src.getStringValue());
        dst.setNumericValue(src.getNumericValue());
        dst.setDateValue(src.getDateValue());
        dst.setPeriodStart(src.getPeriodStart());
        dst.setPeriodEnd(src.getPeriodEnd());
        dst.setBooleanValue(src.getBooleanValue());
        dst.setOption(src.getOption());
        dst.setImageUrl(src.getImageUrl());
    }

    private void applyPayload(CvAttributeValue value, CvAttributeValuePayload payload) {
        value.setStringValue(payload.stringValue());
        value.setNumericValue(payload.numericValue());
        value.setDateValue(payload.dateValue());
        value.setPeriodStart(payload.periodStart());
        value.setPeriodEnd(payload.periodEnd());
        value.setBooleanValue(payload.booleanValue());
        value.setImageUrl(payload.imageUrl());
        value.setOption(payload.optionId() != null ? optionRepository.getReferenceById(payload.optionId()) : null);
    }

    private void applyPayload(ProfileAttributeValue value, CvAttributeValuePayload payload) {
        value.setStringValue(payload.stringValue());
        value.setNumericValue(payload.numericValue());
        value.setDateValue(payload.dateValue());
        value.setPeriodStart(payload.periodStart());
        value.setPeriodEnd(payload.periodEnd());
        value.setBooleanValue(payload.booleanValue());
        value.setImageUrl(payload.imageUrl());
        value.setOption(payload.optionId() != null ? optionRepository.getReferenceById(payload.optionId()) : null);
    }

    private CvDto toEnrichedDto(Cv cv) {
        CvDto dto = cvMapper.toDto(cv);
        dto.setLikesCount(cvLikeRepository.countByCvId(cv.getId()));

        Map<Long, Boolean> requiredByAttributeId = positionAttributeRepository
                .findByPositionIdOrderBySortOrderAsc(cv.getPosition().getId())
                .stream()
                .collect(Collectors.toMap(pa -> pa.getAttribute().getId(), PositionAttribute::isRequired));

        for (CvAttributeValueDto valueDto : dto.getAttributeValues()) {
            valueDto.setRequired(Boolean.TRUE.equals(requiredByAttributeId.get(valueDto.getAttributeId())));
            valueDto.setEmpty(valueDto.getStringValue() == null && valueDto.getNumericValue() == null
                    && valueDto.getDateValue() == null && valueDto.getPeriodStart() == null
                    && valueDto.getBooleanValue() == null && valueDto.getOptionId() == null
                    && valueDto.getImageUrl() == null);
        }
        return dto;
    }
}