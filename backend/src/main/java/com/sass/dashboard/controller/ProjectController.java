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

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

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
            System.out.println("DEBUG: Received project creation request: " + project.getTitle());
            if (project.getTitle() == null || project.getTitle().isEmpty()) {
                return ResponseEntity.badRequest().body("Project title is required");
            }
            if (project.getClient() == null || project.getClient().getId() == null) {
                return ResponseEntity.badRequest().body("Client is required");
            }

            User user = getCurrentUser();
            System.out.println("DEBUG: Current user: ID=" + user.getId() + ", Email=" + user.getEmail());

            Client client = clientRepository.findById(project.getClient().getId()).orElse(null);

            if (client == null) {
                System.out.println("DEBUG: Client not found with ID: " + project.getClient().getId());
                return ResponseEntity.status(404).body("Client not found");
            }

            System.out.println("DEBUG: Found client: " + client.getName() + " (ID=" + client.getId() + ")");
            
            // Check if client has a user assigned
            if (client.getUser() == null) {
                System.out.println("DEBUG: Client has no owner assigned!");
                return ResponseEntity.status(403).body("Client has no owner");
            }

            System.out.println("DEBUG: Client owner ID: " + client.getUser().getId());

            if (!client.getUser().getId().equals(user.getId())) {
                System.out.println("DEBUG: Permission denied! Client owner ID (" + client.getUser().getId() + ") != Current user ID (" + user.getId() + ")");
                return ResponseEntity.status(403).body("You don't have permission to create projects for this client");
            }

            // Validate status against DB constraint values
            List<String> validStatuses = List.of("PLANNED", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "CANCELLED");
            if (project.getStatus() != null) {
                String status = project.getStatus().toUpperCase().replace(" ", "_");
                if (!validStatuses.contains(status)) {
                    return ResponseEntity.badRequest().body("Invalid status. Allowed values: " + validStatuses);
                }
                project.setStatus(status);
            }

            project.setClient(client);
            Project saved = projectRepository.save(project);
            System.out.println("DEBUG: Project saved successfully with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("DEBUG: Error in project creation: " + e.getMessage());
            e.printStackTrace();
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
                    project.setTitle(updated.getTitle());
                    project.setDescription(updated.getDescription());
                    project.setStatus(updated.getStatus());
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
}
