package com.sass.dashboard.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "proposals")
public class Proposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;
    private String purpose = "PROPOSAL";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    private LocalDateTime createdAt = LocalDateTime.now();

    private ProposalStatus status = ProposalStatus.DRAFT;

    public Proposal() {}

    public Proposal(Long id, String title, String content, String purpose, Client client, Project project, LocalDateTime createdAt, ProposalStatus status) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.purpose = purpose;
        this.client = client;
        this.project = project;
        this.createdAt = createdAt;
        this.status = status;
    }

    public static ProposalBuilder builder() {
        return new ProposalBuilder();
    }

    public static class ProposalBuilder {
        private Long id;
        private String title;
        private String content;
        private String purpose = "PROPOSAL";
        private Client client;
        private Project project;
        private LocalDateTime createdAt = LocalDateTime.now();
        private ProposalStatus status = ProposalStatus.DRAFT;

        public ProposalBuilder id(Long id) { this.id = id; return this; }
        public ProposalBuilder title(String title) { this.title = title; return this; }
        public ProposalBuilder content(String content) { this.content = content; return this; }
        public ProposalBuilder purpose(String purpose) { this.purpose = purpose; return this; }
        public ProposalBuilder client(Client client) { this.client = client; return this; }
        public ProposalBuilder project(Project project) { this.project = project; return this; }
        public ProposalBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProposalBuilder status(ProposalStatus status) { this.status = status; return this; }

        public Proposal build() {
            return new Proposal(id, title, content, purpose, client, project, createdAt, status);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public ProposalStatus getStatus() { return status; }
    public void setStatus(ProposalStatus status) { this.status = status; }

    public enum ProposalStatus {
        DRAFT, SENT, ACCEPTED, REJECTED
    }
}
