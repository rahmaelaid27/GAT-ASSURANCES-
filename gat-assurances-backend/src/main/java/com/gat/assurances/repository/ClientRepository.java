package com.gat.assurances.repository;

import com.gat.assurances.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByUserId(Long userId);

    Optional<Client> findByUserCin(String cin);

    Optional<Client> findByNumeroPolice(String numeroPolice);

    Optional<Client> findByUserEmail(String email);

    boolean existsByNumeroPolice(String numeroPolice);

    @Query("SELECT c FROM Client c WHERE " +
           "LOWER(c.user.nom) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(c.user.prenom) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(c.user.email) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(c.numeroPolice) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Client> search(String q);
}
