package com.sass.dashboard.controller;

import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.User;
import com.sass.dashboard.repository.ClientRepository;
import com.sass.dashboard.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientRepository repo;
    private final UserRepository userRepository;

    public ClientController(ClientRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found in database: " + email));
        }
        throw new RuntimeException("User not authenticated correctly. Principal is: " + principal.toString());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Client client) {
        try {
            System.out.println("DEBUG: Received client creation request for: " + client.getName());
            
            if (client.getEmail() == null || client.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (client.getName() == null || client.getName().isEmpty()) {
                return ResponseEntity.badRequest().body("Name is required");
            }
            
            User currentUser = getCurrentUser();
            System.out.println("DEBUG: Current user for client creation: " + currentUser.getEmail());
            
            client.setUser(currentUser);
            Client saved = repo.save(client);
            System.out.println("DEBUG: Client saved successfully with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.out.println("DEBUG: Data integrity violation: " + e.getMessage());
            return ResponseEntity.badRequest().body("A client with this email already exists.");
        } catch (Exception e) {
            System.out.println("DEBUG: Error in client creation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Client> getAll() {
        User user = getCurrentUser();
        return repo.findByUser(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Client updated) {
        User user = getCurrentUser();
        return repo.findById(id)
                .map(client -> {
                    if (!client.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("You don't have permission to update this client");
                    }
                    client.setName(updated.getName());
                    client.setEmail(updated.getEmail());
                    client.setCompany(updated.getCompany());
                    client.setAddress(updated.getAddress());
                    client.setPhone(updated.getPhone());
                    client.setStatus(updated.getStatus());
                    client.setNotes(updated.getNotes());
                    return ResponseEntity.ok(repo.save(client));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User user = getCurrentUser();
        return repo.findById(id)
                .map(client -> {
                    if (!client.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("You don't have permission to delete this client");
                    }
                    repo.delete(client);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
