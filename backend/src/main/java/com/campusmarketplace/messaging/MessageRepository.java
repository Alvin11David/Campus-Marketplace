package com.campusmarketplace.messaging;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT COUNT(m) FROM Message m")
    long countAll();

    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadByConversation(@Param("conversationId") Long conversationId,
                                   @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
    void markAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.recipient.id = :userId AND m.isRead = false AND m.sender.id != :userId")
    long countTotalUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT MIN(m.createdAt) FROM Message m WHERE m.conversation.id = :conversationId")
    java.time.Instant findFirstMessageTime(@Param("conversationId") Long conversationId);

    @Modifying
    void deleteByConversationId(Long conversationId);
}
