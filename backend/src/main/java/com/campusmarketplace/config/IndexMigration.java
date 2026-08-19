package com.campusmarketplace.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class IndexMigration {

    private static final Logger log = LoggerFactory.getLogger(IndexMigration.class);

    private final DataSource dataSource;

    public IndexMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void createIndexes() {
        String[] statements = {
            "CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)",
            "CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC)",
            "CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id)",
            "CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(campus_location_id)",
            "CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(listing_type)",
            "CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id)",
            "CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id, sort_order)",
            "CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON listing_views(listing_id)",
            "CREATE INDEX IF NOT EXISTS idx_listing_views_user ON listing_views(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id)",
            "CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id)",
            "CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)",
            "CREATE INDEX IF NOT EXISTS idx_conversations_initiator ON conversations(initiator_id)",
            "CREATE INDEX IF NOT EXISTS idx_conversations_recipient ON conversations(recipient_id)",
        };

        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            for (String sql : statements) {
                stmt.execute(sql);
            }
            log.info("Database indexes created/verified successfully");
        } catch (Exception e) {
            log.warn("Could not create indexes (non-fatal): {}", e.getMessage());
        }
    }
}
