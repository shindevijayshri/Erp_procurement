package com.erp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendRFQEmail(
            String vendorEmail,
            String vendorName,
            String prNumber,
            String items
    ) {

        System.out.println("====================================");
        System.out.println("EMAIL SERVICE CALLED");
        System.out.println("Vendor Name: " + vendorName);
        System.out.println("Vendor Email: " + vendorEmail);
        System.out.println("PR Number: " + prNumber);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(vendorEmail);

        message.setSubject(
                "Request for Quotation (RFQ) - " + prNumber
        );

        String emailBody =
                "Dear " + vendorName + ",\n\n"
                + "Greetings from our company.\n\n"
                + "We would like to request a quotation for the following items "
                + "as part of Purchase Requisition " + prNumber + ".\n\n"
                + "Required Items:\n"
                + "----------------------------------------\n"
                + items
                + "----------------------------------------\n\n"
                + "Kindly provide your quotation including:\n"
                + "- Unit price\n"
                + "- Total price\n"
                + "- GST / applicable taxes\n"
                + "- Delivery time\n"
                + "- Payment terms\n"
                + "- Quotation validity\n\n"
                + "Please send your quotation at the earliest.\n\n"
                + "Regards,\n"
                + "Purchase Department\n"
                + "ERP Procurement System";

        message.setText(emailBody);

        System.out.println("Attempting to send email...");

        try {

            mailSender.send(message);

            System.out.println("EMAIL SENT SUCCESSFULLY!");
            System.out.println("====================================");

        } catch (Exception e) {

            System.out.println("EMAIL SENDING FAILED!");
            System.out.println("Error: " + e.getMessage());

            e.printStackTrace();

            System.out.println("====================================");

            throw e;
        }
    }
}