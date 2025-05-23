import { apiService } from '@/services/apiService';
import { 
  Message, 
  CreateMessageData, 
  SendMessageData,
  PaginatedResponse, 
  ApiResponse, 
  SearchParams, 
  MessageSend,
  Stats
} from '@/types';

class MessageService {
  async getAll(params?: SearchParams): Promise<PaginatedResponse<Message>> {
    return apiService.get<PaginatedResponse<Message>>('/messages', params);
  }

  async getById(id: string): Promise<Message> {
    const response = await apiService.get<{ success: boolean; data: Message }>(`/messages/${id}`);
    return response.data;
  }

  async create(data: CreateMessageData): Promise<Message> {
    const response = await apiService.post<{ success: boolean; data: Message }>('/messages', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateMessageData>): Promise<Message> {
    const response = await apiService.put<{ success: boolean; data: Message }>(`/messages/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/messages/${id}`);
  }

  async send(id: string, data: SendMessageData): Promise<{ recipientCount: number }> {
    const response = await apiService.post<{ success: boolean; recipientCount: number }>(`/messages/${id}/send`, data);
    return { recipientCount: response.recipientCount };
  }

  async schedule(id: string, scheduledAt: string): Promise<Message> {
    const response = await apiService.post<{ success: boolean; data: Message }>(`/messages/${id}/schedule`, {
      scheduledAt,
    });
    return response.data;
  }

  async getSends(messageId: string): Promise<MessageSend[]> {
    const response = await apiService.get<{ success: boolean; sends: MessageSend[] }>(`/messages/${messageId}/sends`);
    return response.sends;
  }

  async search(searchTerm: string): Promise<Message[]> {
    const response = await apiService.get<{ success: boolean; messages: Message[] }>('/messages/search', { q: searchTerm });
    return response.messages;
  }

  async getStats(): Promise<Stats['messages']> {
    const response = await apiService.get<{ success: boolean; stats: Stats['messages'] }>('/messages/stats');
    return response.stats;
  }

  async getByEvent(eventId: string): Promise<Message[]> {
    const response = await apiService.get<{ success: boolean; messages: Message[] }>(`/messages/event/${eventId}`);
    return response.messages;
  }

  // Template management
  async createTemplate(data: {
    name: string;
    subject: string;
    content: string;
    messageType: 'email' | 'sms' | 'whatsapp' | 'push';
    variables?: string[];
  }): Promise<{ id: string; name: string }> {
    const response = await apiService.post<{ success: boolean; template: { id: string; name: string } }>('/messages/templates', data);
    return response.template;
  }

  async getTemplates(): Promise<Array<{
    id: string;
    name: string;
    subject: string;
    content: string;
    messageType: string;
    variables: string[];
  }>> {
    const response = await apiService.get<{ success: boolean; templates: any[] }>('/messages/templates');
    return response.templates;
  }

  async createFromTemplate(templateId: string, data: {
    eventId?: string;
    scheduledAt?: string;
    variables?: Record<string, string>;
  }): Promise<Message> {
    const response = await apiService.post<{ success: boolean; data: Message }>(`/messages/templates/${templateId}/create`, data);
    return response.data;
  }

  // WhatsApp specific methods
  async sendWhatsApp(data: {
    recipientIds: string[];
    templateName?: string;
    message?: string;
    parameters?: string[];
    media?: {
      type: 'image' | 'document' | 'video';
      url: string;
      caption?: string;
    };
  }): Promise<{ success: boolean; messageIds: string[] }> {
    const response = await apiService.post<{ success: boolean; messageIds: string[] }>('/messages/whatsapp/send', data);
    return response;
  }

  async getWhatsAppTemplates(): Promise<Array<{
    name: string;
    language: string;
    category: string;
    components: any[];
  }>> {
    const response = await apiService.get<{ success: boolean; templates: any[] }>('/messages/whatsapp/templates');
    return response.templates;
  }

  async testWhatsAppConnection(): Promise<{ connected: boolean; phone?: string }> {
    const response = await apiService.get<{ success: boolean; connected: boolean; phone?: string }>('/messages/whatsapp/test');
    return response;
  }

  // Bulk operations
  async bulkSend(messageIds: string[], recipientIds: string[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ messageId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/messages/bulk-send', {
      messageIds,
      recipientIds,
    });
    return response;
  }

  async bulkSchedule(data: Array<{
    messageId: string;
    scheduledAt: string;
  }>): Promise<{
    success: number;
    failed: number;
    results: Array<{ messageId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/messages/bulk-schedule', { messages: data });
    return response;
  }

  // Analytics
  async getDeliveryAnalytics(messageId: string): Promise<{
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    timeline: Array<{
      timestamp: string;
      event: string;
      count: number;
    }>;
  }> {
    const response = await apiService.get(`/messages/${messageId}/analytics`);
    return response;
  }

  async getOverallAnalytics(dateFrom?: string, dateTo?: string): Promise<{
    totalMessages: number;
    totalRecipients: number;
    deliveryRate: number;
    readRate: number;
    byMessageType: Record<string, {
      count: number;
      deliveryRate: number;
      readRate: number;
    }>;
    timeline: Array<{
      date: string;
      sent: number;
      delivered: number;
      read: number;
    }>;
  }> {
    const params: any = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    
    const response = await apiService.get('/messages/analytics', params);
    return response;
  }

  // Export functionality
  async exportMessages(params?: {
    status?: string;
    messageType?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'csv' | 'excel';
  }): Promise<void> {
    const format = params?.format || 'csv';
    const filename = `messages.${format === 'csv' ? 'csv' : 'xlsx'}`;
    await apiService.downloadFile('/messages/export', filename);
  }

  async exportSends(messageId: string, format: 'csv' | 'excel' = 'csv'): Promise<void> {
    const filename = `message-${messageId}-sends.${format === 'csv' ? 'csv' : 'xlsx'}`;
    await apiService.downloadFile(`/messages/${messageId}/sends/export?format=${format}`, filename);
  }

  // Message status management
  async cancelScheduled(id: string): Promise<Message> {
    const response = await apiService.post<{ success: boolean; data: Message }>(`/messages/${id}/cancel`);
    return response.data;
  }

  async retry(id: string, recipientIds?: string[]): Promise<{ recipientCount: number }> {
    const response = await apiService.post<{ success: boolean; recipientCount: number }>(`/messages/${id}/retry`, {
      recipientIds,
    });
    return { recipientCount: response.recipientCount };
  }

  // Duplicate message
  async duplicate(id: string, newSubject?: string): Promise<Message> {
    const originalMessage = await this.getById(id);
    
    const duplicateData: CreateMessageData = {
      eventId: originalMessage.eventId,
      subject: newSubject || `${originalMessage.subject} (Copie)`,
      content: originalMessage.content,
      messageType: originalMessage.messageType,
      metadata: { ...originalMessage.metadata },
    };

    return this.create(duplicateData);
  }
}

export const messageService = new MessageService();
export default messageService;