import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Users,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { Modal } from '@/components/UI/Modal';
import { Message } from '@/types';
import { messageService } from '@/services/messageService';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    loadMessages();
  }, [searchTerm, statusFilter, typeFilter, pagination.page]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      let response;

      if (searchTerm) {
        const searchResults = await messageService.search(searchTerm);
        response = {
          messages: searchResults,
          total: searchResults.length,
          page: 1,
          totalPages: 1,
        };
      } else {
        const params: any = {
          page: pagination.page,
          limit: 12,
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        if (typeFilter !== 'all') {
          params.messageType = typeFilter;
        }

        response = await messageService.getAll(params);
      }

      setMessages(response.messages || []);
      setPagination({
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des messages');
      console.error('Error loading messages:', error);
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

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      await messageService.delete(selectedMessage.id);
      toast.success('Message supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicateMessage = async (message: Message) => {
    try {
      await messageService.duplicate(message.id);
      toast.success('Message dupliqué avec succès');
      loadMessages();
    } catch (error) {
      toast.error('Erreur lors de la duplication');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-secondary-100 text-secondary-800',
      scheduled: 'bg-warning-100 text-warning-800',
      sending: 'bg-primary-100 text-primary-800',
      sent: 'bg-success-100 text-success-800',
      failed: 'bg-error-100 text-error-800',
    };

    const icons = {
      draft: MessageSquare,
      scheduled: Clock,
      sending: Send,
      sent: CheckCircle,
      failed: XCircle,
    };

    const labels = {
      draft: 'Brouillon',
      scheduled: 'Programmé',
      sending: 'En cours',
      sent: 'Envoyé',
      failed: 'Échec',
    };

    const Icon = icons[status as keyof typeof icons] || AlertCircle;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      email: Mail,
      sms: Phone,
      whatsapp: MessageCircle,
      push: Send,
    };

    const Icon = icons[type as keyof typeof icons] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      email: 'text-primary-600',
      sms: 'text-success-600',
      whatsapp: 'text-whatsapp-600',
      push: 'text-warning-600',
    };

    return colors[type as keyof typeof colors] || 'text-secondary-600';
  };

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'scheduled', label: 'Programmés' },
    { value: 'sent', label: 'Envoyés' },
    { value: 'failed', label: 'Échecs' },
  ];

  const typeOptions = [
    { value: 'all', label: 'Tous les types' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'push', label: 'Push' },
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
            Messages
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Gérez vos campagnes de communication multi-canal
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            as={Link}
            to="/messages/new"
            leftIcon={<Plus className="h-4 w-4" />}
            size="lg"
          >
            Nouveau message
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Rechercher un message..."
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
          
          <div>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="form-select w-full"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Messages Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <MessageSquare className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">
            Aucun message trouvé
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Aucun message ne correspond à vos critères.'
              : 'Commencez par créer votre premier message.'
            }
          </p>
          <div className="mt-6">
            <Button
              as={Link}
              to="/messages/new"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Créer un message
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
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl border border-secondary-100 shadow-soft hover:shadow-medium transition-all duration-200 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-secondary-50 ${getTypeColor(message.messageType)}`}>
                      {getTypeIcon(message.messageType)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-secondary-500 uppercase">
                        {message.messageType}
                      </span>
                      {getStatusBadge(message.status)}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="p-1 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                      <Link to={`/messages/${message.id}`}>
                        {message.subject}
                      </Link>
                    </h3>
                    <p className="text-sm text-secondary-600 line-clamp-3 mt-1">
                      {message.content.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {message.eventTitle && (
                      <div className="flex items-center text-sm text-secondary-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {message.eventTitle}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-secondary-600">
                      <Users className="h-4 w-4 mr-2" />
                      {message.totalRecipients || 0} destinataire(s)
                    </div>
                    
                    <div className="flex items-center text-sm text-secondary-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {message.scheduledAt 
                        ? `Programmé pour ${format(new Date(message.scheduledAt), 'PPp', { locale: fr })}`
                        : `Créé ${format(new Date(message.createdAt), 'PPp', { locale: fr })}`
                      }
                    </div>
                  </div>

                  {message.status === 'sent' && (
                    <div className="pt-3 border-t border-secondary-100">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-sm font-medium text-success-600">
                            {message.successfulSends || 0}
                          </p>
                          <p className="text-xs text-secondary-500">Réussis</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-error-600">
                            {message.failedSends || 0}
                          </p>
                          <p className="text-xs text-secondary-500">Échecs</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/messages/${message.id}`}
                      className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    {message.status === 'draft' && (
                      <Link
                        to={`/messages/${message.id}/edit`}
                        className="p-2 text-secondary-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                    
                    <button
                      onClick={() => handleDuplicateMessage(message)}
                      className="p-2 text-secondary-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    
                    {message.status !== 'sending' && (
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {message.status === 'draft' && (
                    <Button
                      as={Link}
                      to={`/messages/${message.id}/edit`}
                      size="sm"
                      leftIcon={<Send className="h-4 w-4" />}
                    >
                      Envoyer
                    </Button>
                  )}
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
        title="Supprimer le message"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Êtes-vous sûr de vouloir supprimer le message{' '}
            <span className="font-semibold">{selectedMessage?.subject}</span> ?
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
              onClick={handleDeleteMessage}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { MessagesPage };
export default MessagesPage;