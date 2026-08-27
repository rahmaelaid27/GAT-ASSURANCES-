package com.gat.assurances.service;

import com.gat.assurances.entity.AuditLog;
import com.gat.assurances.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String description, String tableConcernee,
                    Long enregistrementId, String ancienneValeur, String nouvelleValeur, String resultat) {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes()).getRequest();

            AuditLog audit = AuditLog.builder()
                    .action(action)
                    .description(description)
                    .tableConcernee(tableConcernee)
                    .enregistrementId(enregistrementId)
                    .ancienneValeur(ancienneValeur)
                    .nouvelleValeur(nouvelleValeur)
                    .adresseIp(request.getRemoteAddr())
                    .navigateur(request.getHeader("User-Agent"))
                    .date(LocalDateTime.now())
                    .resultat(resultat)
                    .build();

            auditLogRepository.save(audit);
        } catch (Exception e) {
            // Silent fail for audit
        }
    }
}

