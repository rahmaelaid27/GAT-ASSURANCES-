package com.gat.assurances.repository;

import com.gat.assurances.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByCommentaireId(Long commentaireId);
    Optional<Reaction> findByCommentaireIdAndUserId(Long commentaireId, Long userId);
}
