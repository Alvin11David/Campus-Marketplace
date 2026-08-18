package com.campusmarketplace.listing;

import com.campusmarketplace.user.User;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
    List<SearchLog> findByUser(User user);

    @Query("SELECT sl.category.id, COUNT(sl) FROM SearchLog sl WHERE sl.user.id = :userId AND sl.category.id IS NOT NULL GROUP BY sl.category.id")
    List<Object[]> countByUserGroupedByCategory(@Param("userId") Long userId);

    @Query("SELECT COUNT(sl) FROM SearchLog sl WHERE sl.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT sl.queryText, COUNT(sl) as cnt FROM SearchLog sl WHERE sl.queryText IS NOT NULL AND sl.queryText <> '' GROUP BY sl.queryText ORDER BY cnt DESC")
    List<Object[]> findTopSearchTerms(Pageable pageable);
}
