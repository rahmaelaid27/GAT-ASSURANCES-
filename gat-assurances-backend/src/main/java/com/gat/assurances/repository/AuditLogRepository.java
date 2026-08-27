package com.gat.assurances.repository;

import com.gat.assurances.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByDateDesc(Long userId);
    List<AuditLog> findByActionContaining(String action);
    List<AuditLog> findByDateBetween(LocalDateTime debut, LocalDateTime fin);
}

