package com.campusmarketplace.moderation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {
    List<AdminActionLog> findTop10ByOrderByCreatedAtDesc();
}
