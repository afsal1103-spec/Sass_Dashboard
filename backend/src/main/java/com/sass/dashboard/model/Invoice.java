package com.sass.dashboard.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    private BigDecimal amount;
    private LocalDate issueDate;
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.PENDING;

    public Invoice() {}

    public Invoice(Long id, String invoiceNumber, Client client, Project project, BigDecimal amount, LocalDate issueDate, LocalDate dueDate, InvoiceStatus status) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.client = client;
        this.project = project;
        this.amount = amount;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.status = status;
    }

    public static InvoiceBuilder builder() {
        return new InvoiceBuilder();
    }

    public static class InvoiceBuilder {
        private Long id;
        private String invoiceNumber;
        private Client client;
        private Project project;
        private BigDecimal amount;
        private LocalDate issueDate;
        private LocalDate dueDate;
        private InvoiceStatus status = InvoiceStatus.PENDING;

        public InvoiceBuilder id(Long id) { this.id = id; return this; }
        public InvoiceBuilder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
        public InvoiceBuilder client(Client client) { this.client = client; return this; }
        public InvoiceBuilder project(Project project) { this.project = project; return this; }
        public InvoiceBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public InvoiceBuilder issueDate(LocalDate issueDate) { this.issueDate = issueDate; return this; }
        public InvoiceBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public InvoiceBuilder status(InvoiceStatus status) { this.status = status; return this; }

        public Invoice build() {
            return new Invoice(id, invoiceNumber, client, project, amount, issueDate, dueDate, status);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus status) { this.status = status; }

    public enum InvoiceStatus {
        PENDING, PAID, OVERDUE, CANCELLED
    }
}
