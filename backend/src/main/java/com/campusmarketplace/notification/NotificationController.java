package com.campusmarketplace.notification;

import com.campusmarketplace.common.PageResponse;
import com.campusmarketplace.notification.dto.NotificationResponse;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.User;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getNotifications(
        @CurrentUser User user,
        @RequestParam(defaultValue = "false") boolean archived,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int pageSize) {
        var pageable = PageRequest.of(page, pageSize);
        var notifPage = notificationRepository.findByUserIdAndIsArchivedOrderByCreatedAtDesc(user.getId(), archived, pageable);
        var dtos = notifPage.getContent().stream().map(NotificationResponse::from).toList();
        var response = PageResponse.from(notifPage, dtos, null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@CurrentUser User user) {
        return ResponseEntity.ok(notificationRepository.countUnreadByUserId(user.getId()));
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @CurrentUser User user) {
        var notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @Transactional
    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@CurrentUser User user) {
        notificationRepository.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Void> archiveNotification(@PathVariable Long id, @CurrentUser User user) {
        var notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        notification.setArchived(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreNotification(@PathVariable Long id, @CurrentUser User user) {
        var notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        notification.setArchived(false);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, @CurrentUser User user) {
        var notification = notificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        notificationRepository.delete(notification);
        return ResponseEntity.noContent().build();
    }
}
