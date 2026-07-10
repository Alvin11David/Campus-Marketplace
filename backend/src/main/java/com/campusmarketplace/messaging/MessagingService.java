package com.campusmarketplace.messaging;

import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.messaging.dto.*;
import com.campusmarketplace.notification.NotificationService;
import com.campusmarketplace.user.User;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ListingRepository listingRepository;
    private final NotificationService notificationService;

    public MessagingService(ConversationRepository conversationRepository,
                            MessageRepository messageRepository,
                            ListingRepository listingRepository,
                            NotificationService notificationService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.listingRepository = listingRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ConversationResponse startConversation(User initiator, StartConversationRequest request) {
        var listing = listingRepository.findByIdWithDetails(request.listingId())
            .orElseThrow(() -> ApiException.notFound("Listing not found"));

        if (listing.getOwner().getId().equals(initiator.getId())) {
            throw ApiException.badRequest("You cannot message yourself");
        }

        var existing = conversationRepository.findExisting(
            request.listingId(), initiator.getId(), listing.getOwner().getId());
        if (existing.isPresent()) {
            var conv = existing.get();
            var msg = messageRepository.save(new Message(conv, initiator, request.initialMessage()));
            conv.setLastMessageAt(msg.getCreatedAt());
            conversationRepository.save(conv);
            notificationService.notify(listing.getOwner(), "new_message",
                "New message from " + initiator.getFullName(),
                request.initialMessage(), "conversation", conv.getId());
            return ConversationResponse.from(conv, initiator.getId(), 0, request.initialMessage());
        }

        var conversation = new Conversation();
        conversation.setListing(listing);
        conversation.setInitiator(initiator);
        conversation.setRecipient(listing.getOwner());
        conversation = conversationRepository.save(conversation);

        var message = messageRepository.save(new Message(conversation, initiator, request.initialMessage()));
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        notificationService.notify(listing.getOwner(), "new_message",
            "New message from " + initiator.getFullName(),
            request.initialMessage(), "conversation", conversation.getId());

        return ConversationResponse.from(conversation, initiator.getId(), 0, request.initialMessage());
    }

    public List<ConversationResponse> getConversations(User user) {
        var conversations = conversationRepository.findByParticipantId(user.getId());
        return conversations.stream().map(conv -> {
            long unread = messageRepository.countUnreadByConversation(conv.getId(), user.getId());
            var messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
            String preview = messages.isEmpty() ? "" : messages.getLast().getBody();
            return ConversationResponse.from(conv, user.getId(), unread, preview);
        }).toList();
    }

    @Transactional
    public List<MessageResponse> getMessages(Long conversationId, User user) {
        var conversation = conversationRepository.findByIdWithDetails(conversationId)
            .orElseThrow(() -> ApiException.notFound("Conversation not found"));

        if (!conversation.getInitiator().getId().equals(user.getId()) &&
            !conversation.getRecipient().getId().equals(user.getId())) {
            throw ApiException.forbidden("You are not a participant in this conversation");
        }

        messageRepository.markAsRead(conversationId, user.getId());
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
            .stream().map(MessageResponse::from).toList();
    }

    @Transactional
    public MessageResponse sendMessage(Long conversationId, User sender, SendMessageRequest request) {
        var conversation = conversationRepository.findByIdWithDetails(conversationId)
            .orElseThrow(() -> ApiException.notFound("Conversation not found"));

        if (!conversation.getInitiator().getId().equals(sender.getId()) &&
            !conversation.getRecipient().getId().equals(sender.getId())) {
            throw ApiException.forbidden("You are not a participant in this conversation");
        }

        var message = messageRepository.save(new Message(conversation, sender, request.body()));
        conversation.setLastMessageAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        var recipient = conversation.getInitiator().getId().equals(sender.getId())
            ? conversation.getRecipient() : conversation.getInitiator();
        notificationService.notify(recipient, "new_message",
            "New message from " + sender.getFullName(),
            request.body(), "conversation", conversation.getId());

        return MessageResponse.from(message);
    }

    @Transactional
    public void markAsRead(Long conversationId, User user) {
        var conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> ApiException.notFound("Conversation not found"));

        if (!conversation.getInitiator().getId().equals(user.getId()) &&
            !conversation.getRecipient().getId().equals(user.getId())) {
            throw ApiException.forbidden("You are not a participant in this conversation");
        }

        messageRepository.markAsRead(conversationId, user.getId());
    }

    @Transactional
    public void archiveConversation(Long conversationId, User user) {
        var conversation = conversationRepository.findByIdWithDetails(conversationId)
            .orElseThrow(() -> ApiException.notFound("Conversation not found"));

        if (conversation.getInitiator().getId().equals(user.getId())) {
            conversation.setInitiatorArchived(true);
        } else if (conversation.getRecipient().getId().equals(user.getId())) {
            conversation.setRecipientArchived(true);
        } else {
            throw ApiException.forbidden("You are not a participant in this conversation");
        }
        conversationRepository.save(conversation);
    }

    @Transactional
    public void restoreConversation(Long conversationId, User user) {
        var conversation = conversationRepository.findByIdWithDetails(conversationId)
            .orElseThrow(() -> ApiException.notFound("Conversation not found"));

        if (conversation.getInitiator().getId().equals(user.getId())) {
            conversation.setInitiatorArchived(false);
        } else if (conversation.getRecipient().getId().equals(user.getId())) {
            conversation.setRecipientArchived(false);
        } else {
            throw ApiException.forbidden("You are not a participant in this conversation");
        }
        conversationRepository.save(conversation);
    }

    @Transactional
    public void deleteConversation(Long conversationId, User user) {
        var conversation = conversationRepository.findByIdWithDetails(conversationId)
            .orElseThrow(() -> ApiException.notFound("Conversation not found"));

        if (!conversation.getInitiator().getId().equals(user.getId()) &&
            !conversation.getRecipient().getId().equals(user.getId())) {
            throw ApiException.forbidden("You are not a participant in this conversation");
        }

        messageRepository.deleteByConversationId(conversationId);
        conversationRepository.delete(conversation);
    }

    public long getTotalUnreadCount(Long userId) {
        return messageRepository.countTotalUnreadByUserId(userId);
    }
}
