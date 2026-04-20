package com.sass.dashboard.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "clients")
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    private String company;
    private String address;
    private String phone;
    private String status = "active";
    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Project> projects;

    public Client() {}

    public Client(Long id, String name, String email, String company, String address, String phone, String status, String notes, LocalDateTime createdAt, User user, List<Project> projects) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.company = company;
        this.address = address;
        this.phone = phone;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
        this.user = user;
        this.projects = projects;
    }

    public static ClientBuilder builder() {
        return new ClientBuilder();
    }

    public static class ClientBuilder {
        private Long id;
        private String name;
        private String email;
        private String company;
        private String address;
        private String phone;
        private String status = "active";
        private String notes;
        private LocalDateTime createdAt = LocalDateTime.now();
        private User user;
        private List<Project> projects;

        public ClientBuilder id(Long id) { this.id = id; return this; }
        public ClientBuilder name(String name) { this.name = name; return this; }
        public ClientBuilder email(String email) { this.email = email; return this; }
        public ClientBuilder company(String company) { this.company = company; return this; }
        public ClientBuilder address(String address) { this.address = address; return this; }
        public ClientBuilder phone(String phone) { this.phone = phone; return this; }
        public ClientBuilder status(String status) { this.status = status; return this; }
        public ClientBuilder notes(String notes) { this.notes = notes; return this; }
        public ClientBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ClientBuilder user(User user) { this.user = user; return this; }
        public ClientBuilder projects(List<Project> projects) { this.projects = projects; return this; }

        public Client build() {
            return new Client(id, name, email, company, address, phone, status, notes, createdAt, user, projects);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<Project> getProjects() { return projects; }
    public void setProjects(List<Project> projects) { this.projects = projects; }
}
