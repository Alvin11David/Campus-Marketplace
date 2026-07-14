package com.campusmarketplace.user;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.campusLocation WHERE u.id = :id")
    Optional<User> findByIdWithLocation(@Param("id") Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.campusLocation WHERE u.email = :email")
    Optional<User> findByEmailWithLocation(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE (u.isProvider = true OR u.isSeller = true) AND u.isActive = true AND u.isSuspended = false AND u.avgRating IS NOT NULL ORDER BY u.avgRating DESC")
    List<User> findTopProviders(Pageable pageable);

    long countByCreatedAtBetween(Instant from, Instant to);

    long countByCreatedAtAfter(Instant after);
}
