package com.sass.dashboard.controller;

import com.sass.dashboard.dto.InvoiceRequest;
import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.Invoice;
import com.sass.dashboard.model.Project;
import com.sass.dashboard.model.User;
import com.sass.dashboard.repository.ClientRepository;
import com.sass.dashboard.repository.InvoiceRepository;
import com.sass.dashboard.repository.ProjectRepository;
import com.sass.dashboard.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private static final Set<String> VALID_STATUSES = Set.of("PENDING", "PAID", "OVERDUE", "CANCELLED");
    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    public InvoiceController(
            InvoiceRepository invoiceRepository,
            ClientRepository clientRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Invoice> getAll() {
        User user = getCurrentUser();
        List<Client> clients = clientRepository.findByUser(user);
        List<Invoice> invoices = invoiceRepository.findByClientInOrderByDueDateDesc(clients);
        autoMarkOverdue(invoices);
        return invoices;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InvoiceRequest request) {
        try {
            User user = getCurrentUser();
            if (request.getClientId() == null) return ResponseEntity.badRequest().body("Client is required");
            if (request.getAmount() == null || request.getAmount().doubleValue() <= 0) {
                return ResponseEntity.badRequest().body("Amount must be greater than zero");
            }
            if (request.getDueDate() == null) return ResponseEntity.badRequest().body("Due date is required");

            Client client = clientRepository.findById(request.getClientId()).orElse(null);
            if (client == null) return ResponseEntity.status(404).body("Client not found");
            if (client.getUser() == null || !client.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body("You don't have permission to create invoices for this client");
            }

            Project project = null;
            if (request.getProjectId() != null) {
                project = projectRepository.findById(request.getProjectId()).orElse(null);
                if (project == null) return ResponseEntity.status(404).body("Project not found");
                if (project.getClient() == null || !project.getClient().getId().equals(client.getId())) {
                    return ResponseEntity.badRequest().body("Project must belong to the selected client");
                }
            }

            Invoice invoice = new Invoice();
            invoice.setInvoiceNumber(buildInvoiceNumber(request.getInvoiceNumber()));
            invoice.setClient(client);
            invoice.setProject(project);
            invoice.setAmount(request.getAmount());
            invoice.setIssueDate(request.getIssueDate() != null ? request.getIssueDate() : LocalDate.now());
            invoice.setDueDate(request.getDueDate());
            invoice.setStatus(resolveStatus(request.getStatus(), request.getDueDate()));

            return ResponseEntity.ok(invoiceRepository.save(invoice));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to create invoice: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InvoiceRequest request) {
        User user = getCurrentUser();
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    if (invoice.getClient() == null || invoice.getClient().getUser() == null ||
                            !invoice.getClient().getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("You don't have permission to update this invoice");
                    }

                    if (request.getAmount() != null && request.getAmount().doubleValue() > 0) {
                        invoice.setAmount(request.getAmount());
                    }

                    if (request.getIssueDate() != null) invoice.setIssueDate(request.getIssueDate());
                    if (request.getDueDate() != null) invoice.setDueDate(request.getDueDate());
                    if (request.getStatus() != null) {
                        Invoice.InvoiceStatus normalized = resolveStatus(request.getStatus(), invoice.getDueDate());
                        if (normalized == null) {
                            return ResponseEntity.badRequest().body("Invalid invoice status. Allowed values: " + VALID_STATUSES);
                        }
                        invoice.setStatus(normalized);
                    }

                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User user = getCurrentUser();
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    if (invoice.getClient() == null || invoice.getClient().getUser() == null ||
                            !invoice.getClient().getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).body("You don't have permission to delete this invoice");
                    }
                    invoiceRepository.delete(invoice);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User getCurrentUser() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void autoMarkOverdue(List<Invoice> invoices) {
        LocalDate today = LocalDate.now();
        boolean changed = false;

        for (Invoice invoice : invoices) {
            if (invoice.getStatus() == Invoice.InvoiceStatus.PENDING &&
                    invoice.getDueDate() != null &&
                    invoice.getDueDate().isBefore(today)) {
                invoice.setStatus(Invoice.InvoiceStatus.OVERDUE);
                changed = true;
            }
        }

        if (changed) {
            invoiceRepository.saveAll(invoices);
        }
    }

    private String buildInvoiceNumber(String requestedNumber) {
        String normalized = requestedNumber == null ? "" : requestedNumber.trim();
        if (!normalized.isBlank() && !invoiceRepository.existsByInvoiceNumber(normalized)) {
            return normalized;
        }

        String generated;
        do {
            generated = "INV-" + Year.now().getValue() + "-" + (1000 + random.nextInt(9000));
        } while (invoiceRepository.existsByInvoiceNumber(generated));

        return generated;
    }

    private Invoice.InvoiceStatus resolveStatus(String value, LocalDate dueDate) {
        if (value == null || value.isBlank()) {
            if (dueDate != null && dueDate.isBefore(LocalDate.now())) {
                return Invoice.InvoiceStatus.OVERDUE;
            }
            return Invoice.InvoiceStatus.PENDING;
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!VALID_STATUSES.contains(normalized)) return null;
        return Invoice.InvoiceStatus.valueOf(normalized);
    }
}
