import { apiService } from '@/services/apiService';
import { 
  Recipient, 
  CreateRecipientData, 
  PaginatedResponse, 
  SearchParams, 
  Stats
} from '@/types';

class RecipientService {
  async getAll(params?: SearchParams): Promise<PaginatedResponse<Recipient>> {
    return apiService.get<PaginatedResponse<Recipient>>('/recipients', params);
  }

  async getById(id: string): Promise<Recipient> {
    const response = await apiService.get<{ success: boolean; recipient: Recipient }>(`/recipients/${id}`);
    return response.recipient;
  }

  async create(data: CreateRecipientData): Promise<Recipient> {
    const response = await apiService.post<{ success: boolean; recipient: Recipient }>('/recipients', data);
    return response.recipient;
  }

  async bulkCreate(recipients: CreateRecipientData[]): Promise<{
    recipients: Recipient[];
    total: number;
    skipped: number;
  }> {
    const response = await apiService.post<{
      success: boolean;
      recipients: Recipient[];
      total: number;
      skipped: number;
    }>('/recipients/bulk', recipients);
    
    return {
      recipients: response.recipients,
      total: response.total,
      skipped: response.skipped,
    };
  }

  async update(id: string, data: Partial<CreateRecipientData>): Promise<Recipient> {
    const response = await apiService.put<{ success: boolean; recipient: Recipient }>(`/recipients/${id}`, data);
    return response.recipient;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/recipients/${id}`);
  }

  async search(searchTerm: string): Promise<Recipient[]> {
    const response = await apiService.get<{ success: boolean; recipients: Recipient[] }>('/recipients/search', { q: searchTerm });
    return response.recipients;
  }

  async getStats(): Promise<Stats['recipients']> {
    const response = await apiService.get<{ success: boolean; stats: Stats['recipients'] }>('/recipients/stats');
    return response.stats;
  }

  async getRecentlyAdded(limit: number = 10): Promise<Recipient[]> {
    const response = await apiService.get<{ success: boolean; recipients: Recipient[] }>('/recipients/recent', { limit });
    return response.recipients;
  }

  // Tag management
  async getAllTags(): Promise<string[]> {
    const response = await apiService.get<{ success: boolean; tags: string[] }>('/recipients/tags');
    return response.tags;
  }

  async getByTags(tags: string[]): Promise<Recipient[]> {
    const response = await apiService.get<{ success: boolean; recipients: Recipient[] }>('/recipients/by-tags', { tags });
    return response.recipients;
  }

  async addTag(id: string, tag: string): Promise<Recipient> {
    const recipient = await this.getById(id);
    const updatedTags = [...(recipient.tags || []), tag];
    return this.update(id, { tags: Array.from(new Set(updatedTags)) });
  }

  async removeTag(id: string, tag: string): Promise<Recipient> {
    const recipient = await this.getById(id);
    const updatedTags = (recipient.tags || []).filter(t => t !== tag);
    return this.update(id, { tags: updatedTags });
  }

  async bulkAddTag(recipientIds: string[], tag: string): Promise<{
    success: number;
    failed: number;
    results: Array<{ recipientId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/recipients/bulk-tag', {
      recipientIds,
      action: 'add',
      tag,
    });
    return response;
  }

  async bulkRemoveTag(recipientIds: string[], tag: string): Promise<{
    success: number;
    failed: number;
    results: Array<{ recipientId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/recipients/bulk-tag', {
      recipientIds,
      action: 'remove',
      tag,
    });
    return response;
  }

  // Opt-in/Opt-out management
  async optOut(id: string): Promise<Recipient> {
    const response = await apiService.put<{ success: boolean; recipient: Recipient }>(`/recipients/${id}/opt-out`);
    return response.recipient;
  }

  async optIn(id: string): Promise<Recipient> {
    const response = await apiService.put<{ success: boolean; recipient: Recipient }>(`/recipients/${id}/opt-in`);
    return response.recipient;
  }

  async bulkOptOut(recipientIds: string[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ recipientId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/recipients/bulk-opt-out', { recipientIds });
    return response;
  }

  async bulkOptIn(recipientIds: string[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ recipientId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/recipients/bulk-opt-in', { recipientIds });
    return response;
  }

  // Import functionality
  async importFromCSV(file: File, options?: {
    skipHeader?: boolean;
    delimiter?: string;
    mapping?: Record<string, string>;
  }): Promise<{
    success: number;
    failed: number;
    duplicates: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const response = await apiService.uploadFile('/recipients/import/csv', file, options);
    return response;
  }

  async getImportTemplate(): Promise<void> {
    await apiService.downloadFile('/recipients/import/template', 'recipients-template.csv');
  }

  // Export functionality
  async export(params?: {
    active?: boolean;
    tags?: string[];
    format?: 'csv' | 'excel';
  }): Promise<void> {
    const format = params?.format || 'csv';
    const filename = `recipients.${format === 'csv' ? 'csv' : 'xlsx'}`;
    
    const queryParams: any = {};
    if (params?.active !== undefined) queryParams.active = params.active;
    if (params?.tags?.length) queryParams.tags = params.tags;
    queryParams.format = format;
    
    await apiService.downloadFile('/recipients/export', filename);
  }

  // Duplicate detection and management
  async findDuplicates(): Promise<Array<{
    email: string;
    recipients: Recipient[];
  }>> {
    const response = await apiService.get<{ success: boolean; duplicates: any[] }>('/recipients/duplicates');
    return response.duplicates;
  }

  async mergeDuplicates(keepRecipientId: string, mergeRecipientIds: string[]): Promise<Recipient> {
    const response = await apiService.post<{ success: boolean; recipient: Recipient }>('/recipients/merge', {
      keepRecipientId,
      mergeRecipientIds,
    });
    return response.recipient;
  }

  // Bulk operations
  async bulkDelete(recipientIds: string[]): Promise<{
    success: number;
    failed: number;
    results: Array<{ recipientId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/recipients/bulk-delete', { recipientIds });
    return response;
  }

  async bulkUpdate(updates: Array<{
    id: string;
    data: Partial<CreateRecipientData>;
  }>): Promise<{
    success: number;
    failed: number;
    results: Array<{ recipientId: string; success: boolean; error?: string }>;
  }> {
    const response = await apiService.post('/recipients/bulk-update', { updates });
    return response;
  }

  // Analytics
  async getEngagementAnalytics(recipientId: string): Promise<{
    totalMessagesReceived: number;
    messagesOpened: number;
    messagesClicked: number;
    eventsAttended: number;
    lastActivity: string;
    engagementScore: number;
    timeline: Array<{
      date: string;
      event: string;
      details: string;
    }>;
  }> {
    const response = await apiService.get(`/recipients/${recipientId}/analytics`);
    return response;
  }

  async getSegmentAnalytics(): Promise<{
    byCompany: Array<{ company: string; count: number }>;
    byTags: Array<{ tag: string; count: number }>;
    byActivity: {
      active: number;
      inactive: number;
      neverEngaged: number;
    };
    growthTimeline: Array<{
      date: string;
      added: number;
      optedOut: number;
      total: number;
    }>;
  }> {
    const response = await apiService.get('/recipients/analytics/segments');
    return response;
  }

  // Validation
  async validateEmail(email: string): Promise<{
    valid: boolean;
    reason?: string;
    suggestions?: string[];
  }> {
    const response = await apiService.post<{
      success: boolean;
      valid: boolean;
      reason?: string;
      suggestions?: string[];
    }>('/recipients/validate-email', { email });
    
    return {
      valid: response.valid,
      reason: response.reason,
      suggestions: response.suggestions,
    };
  }

  async bulkValidateEmails(emails: string[]): Promise<Array<{
    email: string;
    valid: boolean;
    reason?: string;
    suggestions?: string[];
  }>> {
    const response = await apiService.post<{
      success: boolean;
      results: Array<{
        email: string;
        valid: boolean;
        reason?: string;
        suggestions?: string[];
      }>;
    }>('/recipients/validate-emails', { emails });
    
    return response.results;
  }

  // Search and filtering
  async advancedSearch(criteria: {
    email?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    tags?: string[];
    optOut?: boolean;
    lastActivityFrom?: string;
    lastActivityTo?: string;
    createdFrom?: string;
    createdTo?: string;
  }): Promise<Recipient[]> {
    const response = await apiService.post<{ success: boolean; recipients: Recipient[] }>('/recipients/advanced-search', criteria);
    return response.recipients;
  }

  // Duplicate recipient
  async duplicate(id: string, newEmail: string): Promise<Recipient> {
    const originalRecipient = await this.getById(id);
    
    const duplicateData: CreateRecipientData = {
      email: newEmail,
      firstName: originalRecipient.firstName,
      lastName: originalRecipient.lastName,
      phone: originalRecipient.phone,
      company: originalRecipient.company,
      position: originalRecipient.position,
      tags: [...(originalRecipient.tags || [])],
      notes: originalRecipient.notes,
      metadata: { ...originalRecipient.metadata },
    };

    return this.create(duplicateData);
  }
}

export const recipientService = new RecipientService();
export default recipientService;