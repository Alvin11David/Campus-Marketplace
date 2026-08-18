package com.campusmarketplace.moderation;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

    Page<Report> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE (:status IS NULL OR r.status = :status) AND (:targetType IS NULL OR r.targetType = :targetType) ORDER BY r.createdAt ASC")
    Page<Report> findByFilters(@Param("status") String status, @Param("targetType") String targetType, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reporter.id = :userId AND r.targetType = :targetType AND r.targetId = :targetId AND r.status = 'pending'")
    long countOpenReports(@Param("userId") Long userId, @Param("targetType") String targetType, @Param("targetId") Long targetId);

    List<Report> findTop5ByStatusOrderByCreatedAtAsc(String status);

    long countByStatus(String status);
}
