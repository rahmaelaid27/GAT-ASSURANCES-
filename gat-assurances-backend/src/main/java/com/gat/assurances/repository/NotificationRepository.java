package com.gat.assurances.repository;

import com.gat.assurances.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUserIdAndLuFalse(Long userId);

    long countByUserIdAndLuFalse(Long userId);

    void deleteByUserIdAndLuTrue(Long userId);
}
