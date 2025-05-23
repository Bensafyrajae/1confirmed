import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  MapPin, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { Modal } from '@/components/UI/Modal';
import { Event } from '@/types';
import { eventService } from '@/services/eventService';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    loadEvents();
  }, [searchTerm, statusFilter, pagination.page]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: 12,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { q: searchTerm }),
      };

      const response = await eventService.getAll(params);
      setEvents(response.events || []);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des événements');
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await eventService.delete(selectedEvent.id);
      toast.success('Événement supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicateEvent = async (event: Event) => {
    try {
      await eventService.duplicate(event.id);
      toast.success('Événement dupliqué avec succès');
      loadEvents();
    } catch (error) {
      toast.error('Erreur lors de la duplication');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-secondary-100 text-secondary-800',
      active: 'bg-success-100 text-success-800',
      completed: 'bg-primary-100 text-primary-800',
      cancelled: 'bg-error-100 text-error-800',
    };

    const icons = {
      draft: Clock,
      active: CheckCircle,
      completed: CheckCircle,
      cancelled: XCircle,
    };

    const labels = {
      draft: 'Brouillon',
      active: 'Actif',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };

    const Icon = icons[status as keyof typeof icons] || AlertCircle;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'active', label: 'Actifs' },
    { value: 'completed', label: 'Terminés' },
    { value: 'cancelled', label: 'Annulés' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:flex md:items-center md:justify-between"
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Événements
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Gérez tous vos événements et invitations
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            as={Link}
            to="/events/new"
            leftIcon={<Plus className="h-4 w-4" />}
            size="lg"
          >
            Nouvel événement
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="form-select w-full"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <Calendar className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">
            Aucun événement trouvé
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Aucun événement ne correspond à vos critères.'
              : 'Commencez par créer votre premier événement.'
            }
          </p>
          <div className="mt-6">
            <Button
              as={Link}
              to="/events/new"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Créer un événement
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl border border-secondary-100 shadow-soft hover:shadow-medium transition-all duration-200 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      <Link to={`/events/${event.id}`}>
                        {event.title}
                      </Link>
                    </h3>
                    {event.description && (
                      <p className="mt-1 text-sm text-secondary-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="relative ml-4">
                    <button
                      className="p-1 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        // Toggle dropdown menu
                      }}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center text-sm text-secondary-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(event.eventDate), 'PPP à HH:mm', { locale: fr })}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-secondary-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-secondary-600">
                    <Users className="h-4 w-4 mr-2" />
                    {event.currentParticipants || 0} participant{(event.currentParticipants || 0) > 1 ? 's' : ''}
                    {event.maxParticipants && ` / ${event.maxParticipants}`}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {getStatusBadge(event.status)}
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/events/${event.id}/edit`}
                      className="p-2 text-secondary-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicateEvent(event)}
                      className="p-2 text-secondary-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-secondary-100"
        >
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Suivant
            </Button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-secondary-700">
                Affichage de{' '}
                <span className="font-medium">
                  {((pagination.page - 1) * 12) + 1}
                </span>{' '}
                à{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * 12, pagination.total)}
                </span>{' '}
                sur{' '}
                <span className="font-medium">{pagination.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Suivant
                </Button>
              </nav>
            </div>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer l'événement"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Êtes-vous sûr de vouloir supprimer l'événement{' '}
            <span className="font-semibold">{selectedEvent?.title}</span> ?
            Cette action est irréversible.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteEvent}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { EventsPage };
export default EventsPage;