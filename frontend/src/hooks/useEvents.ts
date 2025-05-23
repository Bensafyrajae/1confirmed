import { useState, useEffect, useCallback } from 'react';
import eventService from '../services/eventService';
import { Event, EventStats } from '../types/event';
import { handleApiError } from '../services/apiService';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getAll(params);
      setEvents(response.events);
      return response;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: any) => {
    try {
      const newEvent = await eventService.create(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, eventData: any) => {
    try {
      const updatedEvent = await eventService.update(id, eventData);
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await eventService.delete(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setError,
  };
};

export const useEventStats = () => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await eventService.getStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

export const useUpcomingEvents = (limit = 5) => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const events = await eventService.getUpcoming(limit);
      setUpcomingEvents(events);
      return events;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  return {
    upcomingEvents,
    loading,
    error,
    fetchUpcomingEvents,
  };
};