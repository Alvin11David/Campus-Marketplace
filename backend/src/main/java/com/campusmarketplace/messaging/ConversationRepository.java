package com.campusmarketplace.messaging;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN FETCH c.initiator JOIN FETCH c.recipient LEFT JOIN FETCH c.listing WHERE c.id = :id")
    Optional<Conversation> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT c FROM Conversation c JOIN FETCH c.initiator JOIN FETCH c.recipient LEFT JOIN FETCH c.listing WHERE (c.initiator.id = :userId AND c.initiatorArchived = false) OR (c.recipient.id = :userId AND c.recipientArchived = false) ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findByParticipantId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.listing.id = :listingId AND ((c.initiator.id = :participant1Id AND c.recipient.id = :participant2Id) OR (c.initiator.id = :participant2Id AND c.recipient.id = :participant1Id))")
    Optional<Conversation> findExisting(@Param("listingId") Long listingId,
                                        @Param("participant1Id") Long participant1Id,
                                        @Param("participant2Id") Long participant2Id);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.recipient.id = :userId AND c.lastMessageAt IS NOT NULL")
    long countByRecipientId(@Param("userId") Long userId);
}
