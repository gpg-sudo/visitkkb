// WhatsApp Notification Service

interface BookingDetails {
  id: string;
  itemName: string;
  date: string;
  customerName: string;
  participants: number;
}

class WhatsAppService {
  private apiKey: string;
  private phoneNumberId: string;
  private baseUrl = "https://graph.facebook.com/v17.0";

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID || "";
  }

  /**
   * Send a WhatsApp message
   */
  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      console.log(`📱 Sending WhatsApp to ${to}: ${message}`);

      // In a real implementation, this would call the Meta Graph API
      // const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     messaging_product: 'whatsapp',
      //     to: to,
      //     type: 'text',
      //     text: { body: message }
      //   })
      // });

      // For demo/dev purposes, we'll simulate success
      return true;
    } catch (error) {
      console.error("WhatsApp send error:", error);
      return false;
    }
  }

  /**
   * Send booking confirmation to Operator/Agent
   */
  async sendBookingConfirmation(
    recipientPhone: string,
    bookingDetails: BookingDetails,
  ): Promise<boolean> {
    const message = `
🔔 *New Booking Request*

Booking ID: ${bookingDetails.id}
Item: ${bookingDetails.itemName}
Date: ${bookingDetails.date}
Guest: ${bookingDetails.customerName}
Pax: ${bookingDetails.participants}

Please login to the operator panel to confirm availability.
    `.trim();

    return this.sendMessage(recipientPhone, message);
  }

  /**
   * Send date confirmation request
   */
  async sendDateConfirmation(
    recipientPhone: string,
    itemName: string,
    date: string,
  ): Promise<boolean> {
    const message = `
📅 *Availability Check*

Please confirm availability for:
Item: ${itemName}
Date: ${date}

Reply YES to confirm or NO to decline.
    `.trim();

    return this.sendMessage(recipientPhone, message);
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;
