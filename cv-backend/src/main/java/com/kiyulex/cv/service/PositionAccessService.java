package com.kiyulex.cv.service;

import com.kiyulex.cv.entity.AccessRule;
import com.kiyulex.cv.entity.Position;
import com.kiyulex.cv.entity.ProfileAttributeValue;
import com.kiyulex.cv.repository.AccessRuleRepository;
import com.kiyulex.cv.repository.PositionRepository;
import com.kiyulex.cv.repository.ProfileAttributeValueRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PositionAccessService {

    private final PositionRepository positionRepository;
    private final AccessRuleRepository accessRuleRepository;
    private final ProfileAttributeValueRepository profileAttributeValueRepository;

    public boolean canAccess(Long positionId, Long candidateUserId) {
        Position position = positionRepository.findById(positionId)
                .orElseThrow(() -> new EntityNotFoundException("Position not found: " + positionId));

        if (position.isPublic()) {
            return true;
        }

        List<AccessRule> rules = accessRuleRepository.findByPositionId(positionId);
        return rules.stream().allMatch(rule -> matches(rule, candidateUserId));
    }

    private boolean matches(AccessRule rule, Long candidateUserId) {
        Optional<ProfileAttributeValue> valueOpt =
                profileAttributeValueRepository.findByUserIdAndAttributeId(candidateUserId, rule.getAttribute().getId());

        if (valueOpt.isEmpty()) {
            return false;
        }
        ProfileAttributeValue value = valueOpt.get();

        return switch (rule.getOperator()) {
            case GT  -> compareNumeric(value, rule) > 0;
            case GTE -> compareNumeric(value, rule) >= 0;
            case LT  -> compareNumeric(value, rule) < 0;
            case LTE -> compareNumeric(value, rule) <= 0;
            case EQ  -> equalsValue(value, rule);
            case NEQ -> !equalsValue(value, rule);
            case IS_TRUE  -> Boolean.TRUE.equals(value.getBooleanValue());
            case IS_FALSE -> Boolean.FALSE.equals(value.getBooleanValue());
            case IN -> value.getOption() != null
                    && List.of(rule.getValue().split(",")).contains(value.getOption().getValue());
        };
    }

    private int compareNumeric(ProfileAttributeValue value, AccessRule rule) {
        BigDecimal actual = value.getNumericValue();
        BigDecimal expected = new BigDecimal(rule.getValue());
        return actual == null ? -1 : actual.compareTo(expected);
    }

    private boolean equalsValue(ProfileAttributeValue value, AccessRule rule) {
        if (value.getOption() != null) {
            return value.getOption().getValue().equalsIgnoreCase(rule.getValue());
        }
        if (value.getStringValue() != null) {
            return value.getStringValue().equalsIgnoreCase(rule.getValue());
        }
        if (value.getBooleanValue() != null) {
            return value.getBooleanValue().toString().equalsIgnoreCase(rule.getValue());
        }
        return false;
    }
}