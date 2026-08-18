package com.campusmarketplace.listing;

import com.campusmarketplace.user.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListingViewRepository extends JpaRepository<ListingView, Long> {
    List<ListingView> findByUser(User user);

    @Query("SELECT lv.listing.category.id, COUNT(lv) FROM ListingView lv WHERE lv.user.id = :userId AND lv.listing.category.id IS NOT NULL GROUP BY lv.listing.category.id")
    List<Object[]> countByUserGroupedByCategory(@Param("userId") Long userId);

    @Query("SELECT COUNT(lv) FROM ListingView lv WHERE lv.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}
