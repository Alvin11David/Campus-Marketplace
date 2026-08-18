package com.campusmarketplace.notification;

import com.campusmarketplace.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notify(User user, String notifType, String title, String body,
                       String relatedType, Long relatedId) {
        var notification = new Notification(user, notifType, title, body, relatedType, relatedId);
        notificationRepository.save(notification);
    }
}
