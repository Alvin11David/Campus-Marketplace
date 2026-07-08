package com.campusmarketplace.user;

import java.util.Optional;
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
}
