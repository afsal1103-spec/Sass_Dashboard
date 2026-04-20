package com.sass.dashboard.repository;

import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientIn(List<Client> clients);
    List<Project> findByClientId(Long clientId);
}
