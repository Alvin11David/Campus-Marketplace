package com.campusmarketplace.messaging;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN FETCH c.initiator JOIN FETCH c.recipient LEFT JOIN FETCH c.listing WHERE c.id = :id")
    Optional<Conversation> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT c FROM Conversation c JOIN FETCH c.initiator JOIN FETCH c.recipient LEFT JOIN FETCH c.listing WHERE (c.initiator.id = :userId OR c.recipient.id = :userId) ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findByParticipantId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.listing.id = :listingId AND c.initiator.id = :initiatorId AND c.recipient.id = :recipientId")
    Optional<Conversation> findExisting(@Param("listingId") Long listingId,
                                        @Param("initiatorId") Long initiatorId,
                                        @Param("recipientId") Long recipientId);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.recipient.id = :userId AND c.lastMessageAt IS NOT NULL")
    long countByRecipientId(@Param("userId") Long userId);
}
