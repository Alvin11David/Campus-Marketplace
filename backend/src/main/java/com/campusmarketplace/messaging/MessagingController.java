package com.campusmarketplace.messaging;

import com.campusmarketplace.messaging.dto.*;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.User;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class MessagingController {

    private final MessagingService messagingService;

    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> startConversation(@CurrentUser User user,
                                                                   @Valid @RequestBody StartConversationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(messagingService.startConversation(user, request));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(@CurrentUser User user) {
        return ResponseEntity.ok(messagingService.getConversations(user));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Long id,
                                                             @CurrentUser User user) {
        return ResponseEntity.ok(messagingService.getMessages(id, user));
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(@PathVariable Long id,
                                                       @CurrentUser User user,
                                                       @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(messagingService.sendMessage(id, user, request));
    }

    @PostMapping("/conversations/{id}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, @CurrentUser User user) {
        messagingService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }
}
