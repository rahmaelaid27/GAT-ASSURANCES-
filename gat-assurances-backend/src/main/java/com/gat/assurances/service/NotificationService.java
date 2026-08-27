package com.gat.assurances.service;

import com.gat.assurances.entity.Notification;
import com.gat.assurances.entity.User;
import com.gat.assurances.entity.enums.TypeNotification;
import com.gat.assurances.repository.NotificationRepository;
import com.gat.assurances.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /** Crée et persiste une notification pour un utilisateur. */
    @Transactional
    public Notification envoyer(User user, String titre, String message,
                                TypeNotification type, Long sinistreId) {
        if (user == null) return null;
        Notification notif = Notification.builder()
                .user(user)
                .titre(titre)
                .message(message)
                .type(type)
                .sinistreId(sinistreId)
                .lu(false)
                .build();
        notif = notificationRepository.save(notif);
        log.debug("Notification → {} : {}", user.getEmail(), titre);
        return notif;
    }

    /** Notifications de l'utilisateur connecté, triées par date desc. */
    public List<Notification> findAll(Authentication auth) {
        User user = resolveUser(auth);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    /** Nombre de notifications non lues. */
    public long getUnreadCount(Authentication auth) {
        User user = resolveUser(auth);
        return notificationRepository.countByUserIdAndLuFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long id, Authentication auth) {
        User user = resolveUser(auth);
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable"));
        if (!notif.getUser().getId().equals(user.getId()))
            throw new IllegalArgumentException("Accès refusé");
        notif.setLu(true);
        notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsRead(Authentication auth) {
        User user = resolveUser(auth);
        List<Notification> unread = notificationRepository.findByUserIdAndLuFalse(user.getId());
        unread.forEach(n -> n.setLu(true));        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteRead(Authentication auth) {
        User user = resolveUser(auth);
        notificationRepository.deleteByUserIdAndLuTrue(user.getId());
    }

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
    }
}
