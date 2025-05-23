import { apiService } from '@/services/apiService';
import { 
  Event, 
  CreateEventData, 
  PaginatedResponse, 
  ApiResponse, 
  SearchParams, 
  EventParticipant,
  Stats
} from '@/types';

class EventService {
  async getAll(params?: SearchParams): Promise<PaginatedResponse<Event>> {
    return apiService.get<PaginatedResponse<Event>>('/events', params);
  }

  async getById(id: string): Promise<Event> {
    const response = await apiService.get<{ success: boolean; event: Event }>(`/events/${id}`);
    return response.event;
  }

  async create(data: CreateEventData): Promise<Event> {
    const response = await apiService.post<{ success: boolean; event: Event }>('/events', data);
    return response.event;
  }

  async update(id: string, data: Partial<CreateEventData>): Promise<Event> {
    const response = await apiService.put<{ success: boolean; event: Event }>(`/events/${id}`, data);
    return response.event;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/events/${id}`);
  }

  async getUpcoming(limit: number = 10): Promise<Event[]> {
    const response = await apiService.get<{ success: boolean; events: Event[] }>('/events/upcoming', { limit });
    return response.events;
  }

  async search(searchTerm: string): Promise<Event[]> {
    const response = await apiService.get<{ success: boolean; events: Event[] }>('/events/search', { q: searchTerm });
    return response.events;
  }

  async getStats(): Promise<Stats['events']> {
    const response = await apiService.get<{ success: boolean; stats: Stats['events'] }>('/events/stats');
    return response.stats;
  }

  // Participant management
  async getParticipants(eventId: string): Promise<EventParticipant[]> {
    const response = await apiService.get<{ success: boolean; participants: EventParticipant[] }>(`/events/${eventId}/participants`);
    return response.participants;
  }

  async addParticipant(eventId: string, recipientId: string, status: string = 'invited'): Promise<EventParticipant> {
    const response = await apiService.post<{ success: boolean; participant: EventParticipant }>(`/events/${eventId}/participants`, {
      recipientId,
      status,
    });
    return response.participant;
  }

  async removeParticipant(eventId: string, recipientId: string): Promise<void> {
    await apiService.delete(`/events/${eventId}/participants/${recipientId}`);
  }

  async updateParticipantStatus(eventId: string, recipientId: string, status: string): Promise<EventParticipant> {
    const response = await apiService.put<{ success: boolean; participant: EventParticipant }>(`/events/${eventId}/participants/${recipientId}`, {
      status,
    });
    return response.participant;
  }

  // Bulk operations
  async addMultipleParticipants(eventId: string, recipientIds: string[]): Promise<EventParticipant[]> {
    const participants = await Promise.all(
      recipientIds.map(recipientId => this.addParticipant(eventId, recipientId))
    );
    return participants;
  }

  async bulkUpdateParticipants(eventId: string, updates: { recipientId: string; status: string }[]): Promise<EventParticipant[]> {
    const participants = await Promise.all(
      updates.map(update => this.updateParticipantStatus(eventId, update.recipientId, update.status))
    );
    return participants;
  }

  // Event status management
  async activate(id: string): Promise<Event> {
    return this.update(id, { status: 'active' });
  }

  async complete(id: string): Promise<Event> {
    return this.update(id, { status: 'completed' });
  }

  async cancel(id: string): Promise<Event> {
    return this.update(id, { status: 'cancelled' });
  }

  // Export functionality
  async exportParticipants(eventId: string, format: 'csv' | 'excel' = 'csv'): Promise<void> {
    const filename = `event-${eventId}-participants.${format === 'csv' ? 'csv' : 'xlsx'}`;
    await apiService.downloadFile(`/events/${eventId}/participants/export?format=${format}`, filename);
  }

  async exportEvent(eventId: string): Promise<void> {
    const filename = `event-${eventId}.json`;
    await apiService.downloadFile(`/events/${eventId}/export`, filename);
  }

  // Duplicate event
  async duplicate(id: string, newTitle?: string): Promise<Event> {
    const originalEvent = await this.getById(id);
    
    const duplicateData: CreateEventData = {
      title: newTitle || `${originalEvent.title} (Copie)`,
      description: originalEvent.description,
      eventDate: originalEvent.eventDate,
      location: originalEvent.location,
      status: 'draft',
      maxParticipants: originalEvent.maxParticipants,
      isPublic: originalEvent.isPublic,
      registrationDeadline: originalEvent.registrationDeadline,
      tags: [...originalEvent.tags],
      metadata: { ...originalEvent.metadata },
    };

    return this.create(duplicateData);
  }

  // Event analytics
  async getEventAnalytics(eventId: string): Promise<{
    participantStats: {
      total: number;
      confirmed: number;
      declined: number;
      pending: number;
      attended: number;
    };
    messageStats: {
      sent: number;
      delivered: number;
      read: number;
    };
    timeline: Array<{
      date: string;
      action: string;
      count: number;
    }>;
  }> {
    const response = await apiService.get(`/events/${eventId}/analytics`);
    return response;
  }
}

export const eventService = new EventService();
export default eventService;