package com.sass.dashboard.controller;

import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.Project;
import com.sass.dashboard.model.User;
import com.sass.dashboard.repository.ClientRepository;
import com.sass.dashboard.repository.ProjectRepository;
import com.sass.dashboard.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private static final Set<String> VALID_STATUSES = Set.of("PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED");

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository, ClientRepository clientRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Project project) {
        try {
            if (project.getTitle() == null || project.getTitle().isEmpty()) {
                return ResponseEntity.badRequest().body("Project title is required");
            }
            if (project.getClient() == null || project.getClient().getId() == null) {
                return ResponseEntity.badRequest().body("Client is required");
            }

            User user = getCurrentUser();
            Client client = clientRepository.findById(project.getClient().getId())
                    .orElse(null);

            if (client == null) return ResponseEntity.status(404).body("Client not found");

            // Backfill ownership for legacy records created before user-scoped clients.
            if (client.getUser() == null) {
                client.setUser(user);
                client = clientRepository.save(client);
            } else if (!client.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to create projects for this client");
            }

            String normalizedStatus = normalizeStatus(project.getStatus());
            if (normalizedStatus == null) {
                return ResponseEntity.badRequest().body("Invalid status. Allowed values: " + VALID_STATUSES);
            }

            project.setStatus(normalizedStatus);
            project.setClient(client);
            Project saved = projectRepository.save(project);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Project> getAll() {
        User user = getCurrentUser();
        List<Client> userClients = clientRepository.findByUser(user);
        return projectRepository.findByClientIn(userClients);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Project>> getByClient(@PathVariable Long clientId) {
        User user = getCurrentUser();
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        if (!client.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(projectRepository.findByClientId(clientId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Project updated) {
        User user = getCurrentUser();
        return projectRepository.findById(id)
                .map(project -> {
                    if (!project.getClient().getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("You don't have permission to update this project");
                    }
                    String normalizedStatus = normalizeStatus(updated.getStatus());
                    if (normalizedStatus == null) {
                        return ResponseEntity.badRequest().body("Invalid status. Allowed values: " + VALID_STATUSES);
                    }
                    project.setTitle(updated.getTitle());
                    project.setDescription(updated.getDescription());
                    project.setStatus(normalizedStatus);
                    project.setDeadline(updated.getDeadline());
                    return ResponseEntity.ok(projectRepository.save(project));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User user = getCurrentUser();
        return projectRepository.findById(id)
                .map(project -> {
                    if (!project.getClient().getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("You don't have permission to delete this project");
                    }
                    projectRepository.delete(project);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "PLANNED";
        }
        String normalized = status.trim().replace(" ", "_").toUpperCase(Locale.ROOT);
        return VALID_STATUSES.contains(normalized) ? normalized : null;
    }
}
