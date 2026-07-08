package com.campusmarketplace.notification;

import com.campusmarketplace.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "notif_type", nullable = false, length = 30)
    private String notifType;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 500)
    private String body;

    @Column(name = "related_type", length = 20)
    private String relatedType;

    @Column(name = "related_id")
    private Long relatedId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public Notification() {}

    public Notification(User user, String notifType, String title, String body,
                        String relatedType, Long relatedId) {
        this.user = user;
        this.notifType = notifType;
        this.title = title;
        this.body = body;
        this.relatedType = relatedType;
        this.relatedId = relatedId;
        this.createdAt = Instant.now();
    }

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getNotifType() { return notifType; }
    public void setNotifType(String notifType) { this.notifType = notifType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getRelatedType() { return relatedType; }
    public void setRelatedType(String relatedType) { this.relatedType = relatedType; }
    public Long getRelatedId() { return relatedId; }
    public void setRelatedId(Long relatedId) { this.relatedId = relatedId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public Instant getCreatedAt() { return createdAt; }
}
