import { sendEmail, CORPORATE_MAIL } from "../emailer";
import nodemailer from "nodemailer";

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
  }),
}));

describe("sendEmail", () => {
  const mockTransporter = {
    sendMail: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    mockTransporter.sendMail.mockClear();
  });

  it("should send email with correct options", async () => {
    const emailData = {
      email: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
    };

    await sendEmail(emailData);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: expect.any(String),
      port: expect.any(Number),
      secure: false,
      auth: {
        user: expect.any(String),
        pass: expect.any(String),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: expect.any(String),
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
    });
  });

  it("should send email with attachments", async () => {
    const attachments = [
      {
        filename: "test.pdf",
        path: "/path/to/file.pdf",
      },
    ];

    const emailData = {
      email: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
      attachments,
    };

    await sendEmail(emailData);

    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: expect.any(String),
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
      attachments,
    });
  });

  it("should handle sendMail error", async () => {
    mockTransporter.sendMail.mockRejectedValue(new Error("Send failed"));

    const emailData = {
      email: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
    };

    await expect(sendEmail(emailData)).rejects.toThrow("Send failed");
  });
});

describe("CORPORATE_MAIL", () => {
  it("should have the correct value", () => {
    expect(CORPORATE_MAIL).toBe("info@cursala.com.ar");
  });
});
