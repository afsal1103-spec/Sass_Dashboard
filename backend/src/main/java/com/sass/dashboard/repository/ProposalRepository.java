package com.sass.dashboard.repository;

import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findByClientInOrderByCreatedAtDesc(List<Client> clients);
    long countByClientIn(List<Client> clients);
}
