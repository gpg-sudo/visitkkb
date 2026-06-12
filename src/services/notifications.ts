import sgMail from "@sendgrid/mail";
import prisma from "@/lib/prisma";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@visitkkb.com";

interface CustomerDetails {
  name: string;
  email: string;
  // allow extra fields
  [key: string]: unknown;
}

interface SimpleItem {
  title?: string;
  // allow extra fields
  [key: string]: unknown;
}

interface Booking {
  id: string;
  bookingType: string;
  startDate: Date;
  endDate?: Date | null;
  participants: number;
  totalAmount: number;
  customerDetails: CustomerDetails | string;
  activity?: SimpleItem | null;
  stay?: SimpleItem | null;
  user?: unknown;
}

function parseCustomerDetails(
  customerDetails: CustomerDetails | string,
): CustomerDetails {
  if (typeof customerDetails === "string") {
    try {
      return JSON.parse(customerDetails) as CustomerDetails;
    } catch {
      return { name: "Unknown", email: "" };
    }
  }
  return customerDetails;
}

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const customerDetails = parseCustomerDetails(booking.customerDetails);

  try {
    const itemName =
      booking.activity?.title || booking.stay?.title || "Your booking";
    const itemType = booking.bookingType.toLowerCase();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2b6b5a 0%, #1a4d3e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: Georgia, serif;">VisitKKB</h1>
          <p style="color: #e0f2f1; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">POCKETSIZE ADVENTURE</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #2b6b5a; font-family: Georgia, serif;">Booking Confirmation</h2>
          <p style="color: #666; line-height: 1.6;">Dear ${customerDetails.name},</p>
          <p style="color: #666; line-height: 1.6;">Thank you for booking with VisitKKB! Your ${itemType} reservation has been confirmed.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2b6b5a; margin-top: 0;">${itemName}</h3>
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking.id}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.startDate.toLocaleDateString()}</p>
            ${booking.endDate ? `<p style="margin: 5px 0;"><strong>End Date:</strong> ${booking.endDate.toLocaleDateString()}</p>` : ""}
            <p style="margin: 5px 0;"><strong>Participants:</strong> ${booking.participants}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> MYR ${booking.totalAmount.toFixed(2)}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">We look forward to seeing you soon!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px;">If you have any questions, please contact us at info@visitkkb.com</p>
          </div>
        </div>
      </div>
    `;

    await sgMail.send({
      to: customerDetails.email,
      from: FROM_EMAIL,
      subject: `Booking Confirmation - ${itemName}`,
      html: emailHtml,
    });

    // Log notification
    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        type: "BOOKING_CONFIRMATION",
        channel: "email",
        recipient: customerDetails.email,
        subject: `Booking Confirmation - ${itemName}`,
        content: emailHtml,
        status: "sent",
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Email sending error:", error);

    // Log failed notification
    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        type: "BOOKING_CONFIRMATION",
        channel: "email",
        recipient: customerDetails.email,
        subject: "Booking Confirmation",
        content: "Failed to send",
        status: "failed",
      },
    });
  }
}

export async function sendBookingReminder(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { activity: true, stay: true },
    });

    if (!booking) return;

    const customerDetails = parseCustomerDetails(booking.customerDetails);

    const itemName =
      booking.activity?.title || booking.stay?.title || "Your booking";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2b6b5a;">Booking Reminder</h2>
        <p>This is a friendly reminder about your upcoming booking:</p>
        <p><strong>${itemName}</strong></p>
        <p>Date: ${booking.startDate.toLocaleDateString()}</p>
        <p>We can't wait to see you!</p>
      </div>
    `;

    await sgMail.send({
      to: customerDetails.email,
      from: FROM_EMAIL,
      subject: `Reminder: ${itemName} - Tomorrow!`,
      html: emailHtml,
    });

    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        type: "BOOKING_REMINDER",
        channel: "email",
        recipient: customerDetails.email,
        subject: "Booking Reminder",
        content: emailHtml,
        status: "sent",
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Reminder sending error:", error);
  }
}

export async function sendCancellationNotification(
  bookingId: string,
): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { activity: true, stay: true },
    });

    if (!booking) return;

    const customerDetails = parseCustomerDetails(booking.customerDetails);

    const itemName =
      booking.activity?.title || booking.stay?.title || "Your booking";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Booking Cancelled</h2>
        <p>Your booking has been cancelled:</p>
        <p><strong>${itemName}</strong></p>
        <p>Booking ID: ${booking.id}</p>
        <p>If you did not request this cancellation, please contact us immediately.</p>
      </div>
    `;

    await sgMail.send({
      to: customerDetails.email,
      from: FROM_EMAIL,
      subject: `Cancellation Confirmation - ${itemName}`,
      html: emailHtml,
    });

    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        type: "BOOKING_CANCELLATION",
        channel: "email",
        recipient: customerDetails.email,
        subject: "Booking Cancelled",
        content: emailHtml,
        status: "sent",
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Cancellation notification error:", error);
  }
}
