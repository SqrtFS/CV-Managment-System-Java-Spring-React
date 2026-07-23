package com.kiyulex.cv.service;

import com.kiyulex.cv.dto.DiscussionPostDto;
import com.kiyulex.cv.entity.DiscussionPost;
import com.kiyulex.cv.entity.Position;
import com.kiyulex.cv.mapper.DiscussionPostMapper;
import com.kiyulex.cv.repository.DiscussionPostRepository;
import com.kiyulex.cv.repository.PositionRepository;
import com.kiyulex.cv.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscussionService {

    private final DiscussionPostRepository discussionPostRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final DiscussionPostMapper discussionPostMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public List<DiscussionPostDto> listByPosition(Long positionId) {
        return discussionPostMapper.toDtoList(
                discussionPostRepository.findByPositionIdOrderByCreatedAtAsc(positionId));
    }

    @Transactional
    public DiscussionPostDto post(Long positionId, Long authorId, String content) {
        Position position = positionRepository.findById(positionId)
                .orElseThrow(() -> new EntityNotFoundException("Position not found: " + positionId));

        DiscussionPost post = new DiscussionPost();
        post.setPosition(position);
        post.setAuthor(userRepository.getReferenceById(authorId));
        post.setContent(content);
        post = discussionPostRepository.save(post);

        DiscussionPostDto dto = discussionPostMapper.toDto(post);

        messagingTemplate.convertAndSend("/topic/positions/" + positionId + "/discussion", dto);
        return dto;
    }
}