package com.sass.dashboard.controller;

import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.Invoice;
import com.sass.dashboard.model.Project;
import com.sass.dashboard.model.User;
import com.sass.dashboard.repository.ProjectRepository;
import com.sass.dashboard.repository.ClientRepository;
import com.sass.dashboard.repository.InvoiceRepository;
import com.sass.dashboard.repository.ProposalRepository;
import com.sass.dashboard.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final InvoiceRepository invoiceRepository;
    private final ProposalRepository proposalRepository;
    private final UserRepository userRepository;

    public AnalyticsController(
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            InvoiceRepository invoiceRepository,
            ProposalRepository proposalRepository,
            UserRepository userRepository
    ) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.invoiceRepository = invoiceRepository;
        this.proposalRepository = proposalRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        User user = getCurrentUser();
        List<Client> clients = clientRepository.findByUser(user);
        List<Project> projects = projectRepository.findByClientIn(clients);
        List<Invoice> invoices = invoiceRepository.findByClientInOrderByDueDateDesc(clients);
        LocalDate today = LocalDate.now();

        BigDecimal totalBilled = invoices.stream()
                .map(invoice -> invoice.getAmount() != null ? invoice.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidRevenue = invoices.stream()
                .filter(invoice -> effectiveStatus(invoice, today) == Invoice.InvoiceStatus.PAID)
                .map(invoice -> invoice.getAmount() != null ? invoice.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingRevenue = invoices.stream()
                .filter(invoice -> {
                    Invoice.InvoiceStatus status = effectiveStatus(invoice, today);
                    return status == Invoice.InvoiceStatus.PENDING || status == Invoice.InvoiceStatus.OVERDUE;
                })
                .map(invoice -> invoice.getAmount() != null ? invoice.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long inProgressProjects = projects.stream()
                .filter(project -> "IN_PROGRESS".equalsIgnoreCase(project.getStatus()))
                .count();

        long completedProjects = projects.stream()
                .filter(project -> "COMPLETED".equalsIgnoreCase(project.getStatus()))
                .count();

        long overdueInvoices = invoices.stream()
                .filter(invoice -> effectiveStatus(invoice, today) == Invoice.InvoiceStatus.OVERDUE)
                .count();

        long leadClients = clients.stream()
                .filter(client -> "lead".equalsIgnoreCase(client.getStatus()))
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProjects", projects.size());
        summary.put("activeProjects", inProgressProjects);
        summary.put("completedProjects", completedProjects);
        summary.put("totalClients", clients.size());
        summary.put("leadClients", leadClients);
        summary.put("totalInvoices", invoices.size());
        summary.put("overdueInvoices", overdueInvoices);
        summary.put("proposalCount", proposalRepository.countByClientIn(clients));
        summary.put("totalRevenue", paidRevenue.doubleValue());
        summary.put("totalBilled", totalBilled.doubleValue());
        summary.put("pendingRevenue", pendingRevenue.doubleValue());
        return summary;
    }

    private User getCurrentUser() {
        String email = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Invoice.InvoiceStatus effectiveStatus(Invoice invoice, LocalDate today) {
        if (invoice.getStatus() == Invoice.InvoiceStatus.PENDING &&
                invoice.getDueDate() != null &&
                invoice.getDueDate().isBefore(today)) {
            return Invoice.InvoiceStatus.OVERDUE;
        }
        return invoice.getStatus();
    }
}
