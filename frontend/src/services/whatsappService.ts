import { apiService } from '@/services/apiService';
import { WhatsAppMessage, WhatsAppResponse, WhatsAppConfig } from '@/types';

class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_WHATSAPP_API_KEY || '',
      baseUrl: import.meta.env.VITE_WHATSAPP_API_URL || 'https://api.1confirmed.com',
    };
  }

  // Test connection with 1Confirmed API
  async testConnection(): Promise<{ connected: boolean; phone?: string; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        connected: data.status === 'connected',
        phone: data.phone_number,
      };
    } catch (error: any) {
      console.error('WhatsApp connection test failed:', error);
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  // Send a WhatsApp message using template
  async sendTemplate(message: {
    to: string;
    templateName: string;
    parameters?: string[];
    language?: string;
  }): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/messages/template`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: message.to,
          template: {
            name: message.templateName,
            language: {
              code: message.language || 'fr',
            },
            components: message.parameters ? [{
              type: 'body',
              parameters: message.parameters.map(param => ({
                type: 'text',
                text: param,
              })),
            }] : [],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp message',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        status: data.messages?.[0]?.message_status,
      };
    } catch (error: any) {
      console.error('WhatsApp template send failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Send a free-form WhatsApp message (for existing conversations)
  async sendMessage(message: {
    to: string;
    text: string;
  }): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          type: 'text',
          text: {
            body: message.text,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp message',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        status: data.messages?.[0]?.message_status,
      };
    } catch (error: any) {
      console.error('WhatsApp message send failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Send WhatsApp message with media
  async sendMedia(message: {
    to: string;
    media: {
      type: 'image' | 'document' | 'video';
      url: string;
      caption?: string;
      filename?: string;
    };
  }): Promise<WhatsAppResponse> {
    try {
      const mediaObject: any = {
        link: message.media.url,
      };

      if (message.media.caption) {
        mediaObject.caption = message.media.caption;
      }

      if (message.media.filename && message.media.type === 'document') {
        mediaObject.filename = message.media.filename;
      }

      const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: message.to,
          type: message.media.type,
          [message.media.type]: mediaObject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Failed to send WhatsApp media',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        status: data.messages?.[0]?.message_status,
      };
    } catch (error: any) {
      console.error('WhatsApp media send failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get available WhatsApp Business templates
  async getTemplates(): Promise<Array<{
    name: string;
    language: string;
    category: string;
    status: string;
    components: any[];
  }>> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch WhatsApp templates:', error);
      return [];
    }
  }

  // Get message delivery status
  async getMessageStatus(messageId: string): Promise<{
    status: string;
    timestamp?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/messages/${messageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: data.status,
        timestamp: data.timestamp,
      };
    } catch (error: any) {
      console.error('Failed to get message status:', error);
      return {
        status: 'unknown',
        error: error.message,
      };
    }
  }

  // Bulk send WhatsApp messages
  async sendBulk(messages: Array<{
    to: string;
    templateName: string;
    parameters?: string[];
  }>): Promise<{
    success: number;
    failed: number;
    results: Array<{
      to: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    const results = await Promise.all(
      messages.map(async (message) => {
        try {
          const result = await this.sendTemplate(message);
          return {
            to: message.to,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
          };
        } catch (error: any) {
          return {
            to: message.to,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success,
      failed,
      results,
    };
  }

  // Validate phone number format for WhatsApp
  validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid international format
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return {
        valid: false,
        error: 'Le numéro doit contenir entre 10 et 15 chiffres',
      };
    }

    // Format with country code if not present
    let formatted = cleanPhone;
    if (!cleanPhone.startsWith('33') && cleanPhone.length === 10) {
      // French number without country code
      formatted = '33' + cleanPhone.substring(1);
    }

    return {
      valid: true,
      formatted: '+' + formatted,
    };
  }

  // Get WhatsApp Business account info
  async getAccountInfo(): Promise<{
    name?: string;
    phone?: string;
    verified?: boolean;
    businessProfile?: {
      about?: string;
      address?: string;
      description?: string;
      email?: string;
      websites?: string[];
    };
  }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get WhatsApp account info:', error);
      return {};
    }
  }

  // Update configuration
  updateConfig(config: Partial<WhatsAppConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get current configuration (without sensitive data)
  getConfig(): Omit<WhatsAppConfig, 'apiKey'> {
    return {
      baseUrl: this.config.baseUrl,
    };
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;