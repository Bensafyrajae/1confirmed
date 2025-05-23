import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Copy,
  Send,
  UserPlus,
  MessageSquare,
  Download,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Modal } from '../components/UI/Modal';
import { Input } from '../components/UI/Input';
import { Event, EventParticipant, Recipient } from '../types';
import { eventService } from '../services/eventService';
import { recipientService } from '../services/recipientService';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [availableRecipients, setAvailableRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      loadEventDetails();
      loadAvailableRecipients();
    }
  }, [id]);

  const loadEventDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const [eventData, participantsData] = await Promise.all([
        eventService.getById(id),
        eventService.getParticipants(id),
      ]);
      
      setEvent(eventData);
      setParticipants(participantsData);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'événement');
      navigate('/events');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableRecipients = async () => {
    try {
      const response = await recipientService.getAll({ limit: 100 });
      setAvailableRecipients(response.recipients || []);
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!id) return;

    try {
      await eventService.delete(id);
      toast.success('Événement supprimé avec succès');
      navigate('/events');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicateEvent = async () => {
    if (!event) return;

    try {
      await eventService.duplicate(event.id);
      toast.success('Événement dupliqué avec succès');
      navigate('/events');
    } catch (error) {
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleAddParticipants = async () => {
    if (!id || selectedRecipients.length === 0) return;

    try {
      await eventService.addMultipleParticipants(id, selectedRecipients);
      toast.success(`${selectedRecipients.length} participant(s) ajouté(s)`);
      setShowAddParticipantModal(false);
      setSelectedRecipients([]);
      loadEventDetails();
    } catch (error) {
      toast.error('Erreur lors de l\'ajout des participants');
    }
  };

  const handleRemoveParticipant = async (recipientId: string) => {
    if (!id) return;

    try {
      await eventService.removeParticipant(id, recipientId);
      toast.success('Participant retiré avec succès');
      loadEventDetails();
    } catch (error) {
      toast.error('Erreur lors de la suppression du participant');
    }
  };

  const handleExportParticipants = async () => {
    if (!id) return;

    try {
      await eventService.exportParticipants(id, 'csv');
      toast.success('Export en cours de téléchargement');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-4 h-4 mr-2" />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getParticipantStatusBadge = (status: string) => {
    const styles = {
      invited: 'bg-warning-100 text-warning-800',
      confirmed: 'bg-success-100 text-success-800',
      declined: 'bg-error-100 text-error-800',
      attended: 'bg-primary-100 text-primary-800',
    };

    const labels = {
      invited: 'Invité',
      confirmed: 'Confirmé',
      declined: 'Décliné',
      attended: 'Présent',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const filteredRecipients = availableRecipients.filter(
    recipient => 
      !participants.some(p => p.recipientId === recipient.id) &&
      (recipient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       recipient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       recipient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-error-400" />
        <h3 className="mt-2 text-sm font-medium text-secondary-900">
          Événement non trouvé
        </h3>
        <p className="mt-1 text-sm text-secondary-500">
          L'événement que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <div className="mt-6">
          <Button as={Link} to="/events">
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {event.title}
            </h1>
            <p className="text-sm text-secondary-600">
              Détails et gestion de l'événement
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicateEvent}
            leftIcon={<Copy className="h-4 w-4" />}
          >
            Dupliquer
          </Button>
          <Button
            as={Link}
            to={`/events/${event.id}/edit`}
            variant="outline"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Modifier
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Event Information */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">
                Informations de l'événement
              </h2>
              {getStatusBadge(event.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-secondary-700">
                  <Calendar className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Date et heure</p>
                    <p className="text-sm text-secondary-600">
                      {format(new Date(event.eventDate), 'PPP à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center text-secondary-700">
                    <MapPin className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-sm text-secondary-600">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-secondary-700">
                  <Users className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-sm text-secondary-600">
                      {participants.length}
                      {event.maxParticipants && ` / ${event.maxParticipants}`} participant(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {event.registrationDeadline && (
                  <div>
                    <p className="font-medium text-secondary-700">Date limite d'inscription</p>
                    <p className="text-sm text-secondary-600">
                      {format(new Date(event.registrationDeadline), 'PPP à HH:mm', { locale: fr })}
                    </p>
                  </div>
                )}

                <div>
                  <p className="font-medium text-secondary-700">Visibilité</p>
                  <p className="text-sm text-secondary-600">
                    {event.isPublic ? 'Public' : 'Privé'}
                  </p>
                </div>

                {event.tags.length > 0 && (
                  <div>
                    <p className="font-medium text-secondary-700 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {event.description && (
              <div className="mt-6 pt-6 border-t border-secondary-100">
                <h3 className="font-medium text-secondary-700 mb-2">Description</h3>
                <p className="text-secondary-600 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
            <div className="px-6 py-4 border-b border-secondary-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900">
                  Participants ({participants.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setShowAddParticipantModal(true)}
                    leftIcon={<UserPlus className="h-4 w-4" />}
                  >
                    Ajouter
                  </Button>
                  {participants.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportParticipants}
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      Exporter
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">
                    Aucun participant
                  </h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Commencez par ajouter des participants à votre événement.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowAddParticipantModal(true)}
                      leftIcon={<UserPlus className="h-4 w-4" />}
                    >
                      Ajouter des participants
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {participant.firstName?.charAt(0) || participant.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-secondary-900">
                              {participant.firstName} {participant.lastName}
                            </p>
                            {getParticipantStatusBadge(participant.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-secondary-600">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {participant.email}
                            </div>
                            {participant.company && (
                              <div className="flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {participant.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRemoveParticipant(participant.recipientId)}
                          className="p-2 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                          title="Retirer le participant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Actions rapides
            </h3>
            
            <div className="space-y-3">
              <Button
                as={Link}
                to={`/messages/new?eventId=${event.id}`}
                fullWidth
                leftIcon={<MessageSquare className="h-4 w-4" />}
              >
                Envoyer un message
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Send className="h-4 w-4" />}
                disabled={participants.length === 0}
              >
                Envoyer invitations
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Statistiques
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Total invités</span>
                <span className="font-semibold text-secondary-900">
                  {participants.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Confirmés</span>
                <span className="font-semibold text-success-600">
                  {participants.filter(p => p.status === 'confirmed').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">En attente</span>
                <span className="font-semibold text-warning-600">
                  {participants.filter(p => p.status === 'invited').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Déclinés</span>
                <span className="font-semibold text-error-600">
                  {participants.filter(p => p.status === 'declined').length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Messages récents
            </h3>
            
            <div className="text-center py-4">
              <MessageSquare className="mx-auto h-8 w-8 text-secondary-400" />
              <p className="mt-2 text-sm text-secondary-600">
                Aucun message pour cet événement
              </p>
              <Button
                as={Link}
                to={`/messages/new?eventId=${event.id}`}
                size="sm"
                className="mt-3"
              >
                Créer un message
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Participant Modal */}
      <Modal
        isOpen={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        title="Ajouter des participants"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Rechercher un destinataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Users className="h-4 w-4" />}
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredRecipients.map((recipient) => (
              <label
                key={recipient.id}
                className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100"
              >
                <input
                  type="checkbox"
                  checked={selectedRecipients.includes(recipient.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRecipients([...selectedRecipients, recipient.id]);
                    } else {
                      setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                    }
                  }}
                  className="form-checkbox"
                />
                <div className="flex-1">
                  <p className="font-medium text-secondary-900">
                    {recipient.firstName} {recipient.lastName}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {recipient.email}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddParticipantModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddParticipants}
              disabled={selectedRecipients.length === 0}
            >
              Ajouter ({selectedRecipients.length})
            </Button>
          </div>
        </div>
      </Modal>

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
            <span className="font-semibold">{event.title}</span> ?
            Cette action est irréversible et supprimera également tous les participants associés.
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
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { EventDetailPage };
export default EventDetailPage;