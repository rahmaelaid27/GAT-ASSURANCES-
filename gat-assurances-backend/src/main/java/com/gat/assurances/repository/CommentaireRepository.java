package com.gat.assurances.repository;

import com.gat.assurances.entity.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {

    List<Commentaire> findBySinistreIdOrderByCreatedAtAsc(Long sinistreId);

    List<Commentaire> findByUserId(Long userId);

    long countBySinistreId(Long sinistreId);

    List<Commentaire> findTop10ByOrderByCreatedAtDesc();
}
