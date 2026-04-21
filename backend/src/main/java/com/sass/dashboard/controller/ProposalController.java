package com.sass.dashboard.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sass.dashboard.dto.ProposalGenerateRequest;
import com.sass.dashboard.dto.ProposalSaveRequest;
import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.Project;
import com.sass.dashboard.model.Proposal;
import com.sass.dashboard.model.User;
import com.sass.dashboard.repository.ClientRepository;
import com.sass.dashboard.repository.ProjectRepository;
import com.sass.dashboard.repository.ProposalRepository;
import com.sass.dashboard.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/proposals")
public class ProposalController {
    private static final Set<String> VALID_STATUSES = Set.of("DRAFT", "SENT", "ACCEPTED", "REJECTED");
    private final ProposalRepository proposalRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public ProposalController(
            ProposalRepository proposalRepository,
            ClientRepository clientRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.proposalRepository = proposalRepository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .build();
    }

    @GetMapping
    public List<Proposal> getAll() {
        User user = getCurrentUser();
        List<Client> clients = clientRepository.findByUser(user);
        return proposalRepository.findByClientInOrderByCreatedAtDesc(clients);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProposalSaveRequest request) {
        try {
            if (request.getTitle() == null || request.getTitle().isBlank()) {
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (request.getContent() == null || request.getContent().isBlank()) {
                return ResponseEntity.badRequest().body("Content is required");
            }

            User user = getCurrentUser();
            Client client = null;
            if (request.getClientId() != null) {
                client = clientRepository.findById(request.getClientId()).orElse(null);
                if (client == null) return ResponseEntity.status(404).body("Client not found");
                if (client.getUser() == null || !client.getUser().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body("You don't have permission to save content for this client");
                }
            }

            Project project = null;
            if (request.getProjectId() != null) {
                project = projectRepository.findById(request.getProjectId()).orElse(null);
                if (project == null) return ResponseEntity.status(404).body("Project not found");
                if (project.getClient() == null || project.getClient().getUser() == null ||
                        !project.getClient().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.status(403).body("You don't have permission to use this project");
                }
            }

            if (client == null && project != null) {
                client = project.getClient();
            }
            if (client == null) {
                return ResponseEntity.badRequest().body("Please link this document to at least one client.");
            }

            Proposal.ProposalStatus status = resolveStatus(request.getStatus());
            if (status == null) {
                return ResponseEntity.badRequest().body("Invalid status. Allowed values: " + VALID_STATUSES);
            }

            Proposal proposal = new Proposal();
            proposal.setTitle(request.getTitle().trim());
            proposal.setContent(request.getContent().trim());
            proposal.setPurpose(resolvePurpose(request.getPurpose()));
            proposal.setStatus(status);
            proposal.setClient(client);
            proposal.setProject(project);

            return ResponseEntity.ok(proposalRepository.save(proposal));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save proposal: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        String nextStatus = payload.get("status");
        Proposal.ProposalStatus status = resolveStatus(nextStatus);

        if (status == null) {
            return ResponseEntity.badRequest().body("Invalid status. Allowed values: " + VALID_STATUSES);
        }

        return proposalRepository.findById(id)
                .map(proposal -> {
                    if (!belongsToUser(proposal, user)) {
                        return ResponseEntity.status(403).body("You don't have permission to update this item");
                    }
                    proposal.setStatus(status);
                    return ResponseEntity.ok(proposalRepository.save(proposal));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User user = getCurrentUser();
        return proposalRepository.findById(id)
                .map(proposal -> {
                    if (!belongsToUser(proposal, user)) {
                        return ResponseEntity.status(403).body("You don't have permission to delete this item");
                    }
                    proposalRepository.delete(proposal);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateWithAi(@RequestBody ProposalGenerateRequest request) {
        try {
            if (request.getApiKey() == null || request.getApiKey().isBlank()) {
                return ResponseEntity.badRequest().body("Add your OpenRouter API key to generate with real AI.");
            }
            if (request.getProjectName() == null || request.getProjectName().isBlank()) {
                return ResponseEntity.badRequest().body("Project name is required");
            }
            if (request.getFeatures() == null || request.getFeatures().isBlank()) {
                return ResponseEntity.badRequest().body("At least one feature or requirement is required");
            }

            String mode = normalizeMode(request.getMode());
            String model = request.getModel() == null || request.getModel().isBlank()
                    ? "openrouter/auto"
                    : request.getModel().trim();

            String systemPrompt = """
                    You are a senior freelancer operating a one-person digital agency.
                    Write practical, action-ready output with clear structure and no fluff.
                    Keep language professional but simple for non-technical clients.
                    """;

            String userPrompt = buildPrompt(mode, request);

            Map<String, Object> payload = new HashMap<>();
            payload.put("model", model);
            payload.put("temperature", 0.4);
            payload.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));

            HttpRequest aiRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                    .header("Authorization", "Bearer " + request.getApiKey().trim())
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "https://localhost")
                    .header("X-Title", "Sass Dashboard")
                    .timeout(Duration.ofSeconds(50))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> aiResponse = httpClient.send(aiRequest, HttpResponse.BodyHandlers.ofString());
            if (aiResponse.statusCode() >= 400) {
                return ResponseEntity.status(502).body("AI provider error (" + aiResponse.statusCode() + "). Verify your API key and selected model.");
            }

            JsonNode root = objectMapper.readTree(aiResponse.body());
            JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
            if (contentNode.isMissingNode() || contentNode.asText().isBlank()) {
                return ResponseEntity.status(502).body("AI provider returned an empty response. Try another model.");
            }

            return ResponseEntity.ok(Map.of(
                    "mode", mode,
                    "model", model,
                    "content", contentNode.asText().trim()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("AI generation failed: " + e.getMessage());
        }
    }

    private User getCurrentUser() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean belongsToUser(Proposal proposal, User user) {
        if (proposal.getClient() != null && proposal.getClient().getUser() != null) {
            return proposal.getClient().getUser().getId().equals(user.getId());
        }
        if (proposal.getProject() != null && proposal.getProject().getClient() != null &&
                proposal.getProject().getClient().getUser() != null) {
            return proposal.getProject().getClient().getUser().getId().equals(user.getId());
        }
        return false;
    }

    private Proposal.ProposalStatus resolveStatus(String value) {
        if (value == null || value.isBlank()) return Proposal.ProposalStatus.DRAFT;
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!VALID_STATUSES.contains(normalized)) return null;
        return Proposal.ProposalStatus.valueOf(normalized);
    }

    private String resolvePurpose(String value) {
        if (value == null || value.isBlank()) return "PROPOSAL";
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeMode(String mode) {
        if (mode == null || mode.isBlank()) return "proposal";
        String normalized = mode.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("idea") || normalized.equals("workflow")) {
            return normalized;
        }
        return "proposal";
    }

    private String buildPrompt(String mode, ProposalGenerateRequest request) {
        String clientName = safe(request.getClientName(), "Client");
        String businessGoal = safe(request.getBusinessGoal(), "Improve outcomes, speed, and quality.");
        String timeline = safe(request.getTimeline(), "TBD");
        String pricing = safe(request.getPricingModel(), "Milestone");
        String budget = safe(request.getBudget(), "TBD");
        String notes = safe(request.getPurposeNotes(), "None");

        if ("idea".equals(mode)) {
            return """
                    Build a project idea brief from this input.
                    Project: %s
                    Client: %s
                    Goal: %s
                    Requirements:
                    %s
                    Timeline: %s
                    Budget: %s
                    Extra Notes: %s

                    Format:
                    1) Problem and opportunity
                    2) Solution concept
                    3) MVP scope
                    4) Key risks and mitigation
                    5) Execution plan by week
                    6) Success metrics
                    """.formatted(request.getProjectName().trim(), clientName, businessGoal, request.getFeatures().trim(), timeline, budget, notes);
        }

        if ("workflow".equals(mode)) {
            return """
                    Build an execution workflow for a freelancer.
                    Project: %s
                    Client: %s
                    Goal: %s
                    Requirements:
                    %s
                    Timeline: %s
                    Pricing model: %s
                    Budget: %s
                    Extra Notes: %s

                    Format:
                    1) Discovery checklist
                    2) Delivery phases with milestones
                    3) Communication cadence
                    4) Quality gates
                    5) Invoice checkpoints tied to milestones
                    6) Client handoff and support plan
                    """.formatted(request.getProjectName().trim(), clientName, businessGoal, request.getFeatures().trim(), timeline, pricing, budget, notes);
        }

        return """
                Write a client-ready proposal.
                Project: %s
                Client: %s
                Goal: %s
                Requirements:
                %s
                Timeline: %s
                Pricing model: %s
                Budget: %s
                Extra Notes: %s

                Format:
                - Executive summary
                - Scope and deliverables
                - Timeline and milestones
                - Pricing and payment terms
                - Why this approach
                - Next steps
                """.formatted(request.getProjectName().trim(), clientName, businessGoal, request.getFeatures().trim(), timeline, pricing, budget, notes);
    }

    private String safe(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        return value.trim();
    }
}
