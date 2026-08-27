package com.gat.assurances.repository;

import com.gat.assurances.entity.Archive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArchiveRepository extends JpaRepository<Archive, Long> {
    List<Archive> findByTableSource(String tableSource);
    List<Archive> findByRestaureFalse();
}

