package com.gat.assurances.repository;

import com.gat.assurances.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByCibleId(Long cibleId);
    List<Evaluation> findByTypeEvaluation(com.gat.assurances.entity.enums.TypeEvaluation typeEvaluation);
    List<Evaluation> findBySinistreId(Long sinistreId);
}

