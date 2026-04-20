package com.sass.dashboard.controller;

import com.sass.dashboard.model.Project;
import com.sass.dashboard.repository.ProjectRepository;
import com.sass.dashboard.repository.ClientRepository;
import com.sass.dashboard.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final InvoiceRepository invoiceRepository;

    public AnalyticsController(ProjectRepository projectRepository, ClientRepository clientRepository, InvoiceRepository invoiceRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProjects", projectRepository.count());
        summary.put("totalClients", clientRepository.count());
        summary.put("totalInvoices", invoiceRepository.count());
        summary.put("totalRevenue", 0); // Logic to calculate revenue later
        return summary;
    }
}
