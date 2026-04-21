package com.sass.dashboard.repository;

import com.sass.dashboard.model.Client;
import com.sass.dashboard.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByClientInOrderByDueDateDesc(List<Client> clients);
    boolean existsByInvoiceNumber(String invoiceNumber);
}
