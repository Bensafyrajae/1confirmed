import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Event } from '../../types/event';
import { useEvents } from '../../hooks/useEvents';
import { usePagination } from '../../hooks/useApi';
import EventCard from './EventCard';
import { Button } from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';
import { EVENT_STATUS, EVENT_STATUS_LABELS } from '../../utils/constants';

interface EventListProps {
  onCreateEvent?: () => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (event: Event) => void;
  showActions?: boolean;
}

const EventList: React.FC<EventListProps> = ({
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  showActions = false,
}) => {
  const { events, loading, error, fetchEvents } = useEvents();
  const pagination = usePagination(1, 12);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Charger les événements
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await fetchEvents({
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter || undefined,
          sortBy,
          sortOrder,
        });
        pagination.setTotal(result.total);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    loadEvents();
  }, [pagination.page, pagination.limit, statusFilter, sortBy, sortOrder]);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        // Implémenter la recherche
        console.log('Searching for:', searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    pagination.goToPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
    pagination.goToPage(1);
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner size="lg" center text="Chargement des événements..." />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des événements..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(EVENT_STATUS_LABELS).map(([status, label]) => (
              <option key={status} value={status}>{label}</option>
            ))}
          </select>

          {/* Tri */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder as 'ASC' | 'DESC');
              pagination.goToPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="created_at-DESC">Plus récents</option>
            <option value="created_at-ASC">Plus anciens</option>
            <option value="event_date-ASC">Date croissante</option>
            <option value="event_date-DESC">Date décroissante</option>
            <option value="title-ASC">Titre A-Z</option>
            <option value="title-DESC">Titre Z-A</option>
          </select>

          {onCreateEvent && (
            <Button
              onClick={onCreateEvent}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Nouvel événement
            </Button>
          )}
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Liste des événements */}
      {events.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter || searchTerm 
              ? 'Aucun événement ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier événement.'
            }
          </p>
          {onCreateEvent && !statusFilter && !searchTerm && (
            <div className="mt-6">
              <Button
                onClick={onCreateEvent}
                leftIcon={<PlusIcon className="h-4 w-4" />}
              >
                Créer un événement
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Grille des événements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                showActions={showActions}
              />
            ))}
          </div>

          {/* Indicateur de chargement pour la pagination */}
          {loading && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" />
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPreviousPage}
                  onClick={pagination.previousPage}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={pagination.nextPage}
                >
                  Suivant
                </Button>
              </div>
              
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{pagination.page}</span> sur{' '}
                    <span className="font-medium">{pagination.totalPages}</span> (
                    <span className="font-medium">{pagination.total}</span> événement{pagination.total > 1 ? 's' : ''})
                  </p>
                </div>
                
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={pagination.previousPage}
                      disabled={!pagination.hasPreviousPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Précédent</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Pages */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      const isActive = page === pagination.page;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => pagination.goToPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                            isActive
                              ? 'z-10 bg-indigo-600 text-white focus:bg-indigo-500'
                              : 'text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={pagination.nextPage}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Suivant</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;