package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.ProjectDto;
import com.kiyulex.cv.entity.Project;
import com.kiyulex.cv.entity.Tag;
import com.kiyulex.cv.exception.OptimisticLockConflictException;
import com.kiyulex.cv.mapper.ProjectMapper;
import com.kiyulex.cv.repository.ProjectRepository;
import com.kiyulex.cv.repository.TagRepository;
import com.kiyulex.cv.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    public List<ProjectDto> listByUser(Long userId) {
        return projectMapper.toDtoList(projectRepository.findByUserIdOrderByPeriodEndDesc(userId));
    }

    public ProjectDto getById(Long id, Long requestingUserId, boolean isAdmin) {
        Project project = getEntity(id);
        assertOwnerOrAdmin(project, requestingUserId, isAdmin);
        return projectMapper.toDto(project);
    }

    @Transactional
    public ProjectDto create(Long userId, ProjectDto dto) {
        Project project = new Project();
        project.setUser(userRepository.getReferenceById(userId));
        project.setName(dto.getName());
        project.setPeriodStart(dto.getPeriodStart());
        project.setPeriodEnd(dto.getPeriodEnd());
        project.setDescription(dto.getDescription());
        project.setTags(resolveTags(dto.getTags()));
        return projectMapper.toDto(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto update(Long id, ProjectDto dto, Long requestingUserId, boolean isAdmin) {
        Project project = getEntity(id);
        assertOwnerOrAdmin(project, requestingUserId, isAdmin);

        if (!Objects.equals(project.getVersion(), dto.getVersion())) {
            throw new OptimisticLockConflictException(project.getVersion());
        }

        project.setName(dto.getName());
        project.setPeriodStart(dto.getPeriodStart());
        project.setPeriodEnd(dto.getPeriodEnd());
        project.setDescription(dto.getDescription());
        project.setTags(resolveTags(dto.getTags()));

        return projectMapper.toDto(projectRepository.save(project));
    }

    @Transactional
    public void delete(Long id, Long requestingUserId, boolean isAdmin) {
        Project project = getEntity(id);
        assertOwnerOrAdmin(project, requestingUserId, isAdmin);
        projectRepository.delete(project);
    }

    public List<String> autocompleteTags(String prefix) {
        return tagRepository.findTop10ByNameStartingWithIgnoreCaseOrderByNameAsc(prefix)
                .stream().map(Tag::getName).toList();
    }

    private Project getEntity(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + id));
    }

    private void assertOwnerOrAdmin(Project project, Long requestingUserId, boolean isAdmin) {
        if (isAdmin) return;
        if (!project.getUser().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("You can only modify your own projects");
        }
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
}