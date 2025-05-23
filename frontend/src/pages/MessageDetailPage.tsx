import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  MessageCircle,
  Edit, 
  Trash2, 
  Copy,
  Send,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MousePointer,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/UI/Button';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { Modal } from '@/components/UI/Modal';
import { Message, MessageSend } from '@/types';
import { messageService } from '@/services/messageService';

const MessageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState<Message | null>(null);
  const [sends, setSends] = useState<MessageSend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    timeline: [],
  });

  useEffect(() => {
    if (id) {
      loadMessageDetails();
      loadAnalytics();
    }
  }, [id]);

  const loadMessageDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const [messageData, sendsData] = await Promise.all([
        messageService.getById(id),
        messageService.getSends(id),
      ]);
      
      setMessage(messageData);
      setSends(sendsData);
    } catch (error) {
      toast.error('Erreur lors du chargement du message');
      navigate('/messages');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!id) return;
    
    try {
      const analyticsData = await messageService.getDeliveryAnalytics(id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!id) return;

    try {
      await messageService.delete(id);
      toast.success('Message supprimé avec succès');
      navigate('/messages');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDuplicateMessage = async () => {
    if (!message) return;

    try {
      await messageService.duplicate(message.id);
      toast.success('Message dupliqué avec succès');
      navigate('/messages');
    } catch (error) {
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleRetryFailed = async () => {
    if (!id) return;

    try {
      const failedSends = sends.filter(send => send.status === 'failed');
      const recipientIds = failedSends.map(send => send.recipientId);
      
      await messageService.retry(id, recipientIds);
      toast.success(`Tentative de renvoi pour ${recipientIds.length} destinataire(s)`);
      loadMessageDetails();
    } catch (error) {
      toast.error('Erreur lors du renvoi');
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-4 h-4 mr-2" />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getSendStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-warning-100 text-warning-800',
      sent: 'bg-success-100 text-success-800',
      delivered: 'bg-primary-100 text-primary-800',
      read: 'bg-secondary-100 text-secondary-800',
      failed: 'bg-error-100 text-error-800',
    };

    const labels = {
      pending: 'En attente',
      sent: 'Envoyé',
      delivered: 'Livré',
      read: 'Lu',
      failed: 'Échec',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
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
    return <Icon className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-error-400" />
        <h3 className="mt-2 text-sm font-medium text-secondary-900">
          Message non trouvé
        </h3>
        <p className="mt-1 text-sm text-secondary-500">
          Le message que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <div className="mt-6">
          <Button as={Link} to="/messages">
            Retour aux messages
          </Button>
        </div>
      </div>
    );
  }

  const deliveryRate = analytics.total > 0 ? Math.round((analytics.delivered / analytics.total) * 100) : 0;
  const openRate = analytics.total > 0 ? Math.round((analytics.read / analytics.total) * 100) : 0;

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
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              {getTypeIcon(message.messageType)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {message.subject}
              </h1>
              <p className="text-sm text-secondary-600">
                {message.messageType.toUpperCase()} • {format(new Date(message.createdAt), 'PPP', { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicateMessage}
            leftIcon={<Copy className="h-4 w-4" />}
          >
            Dupliquer
          </Button>
          {message.status === 'draft' && (
            <Button
              as={Link}
              to={`/messages/${message.id}/edit`}
              variant="outline"
              size="sm"
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Modifier
            </Button>
          )}
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
          {/* Message Information */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">
                Détails du message
              </h2>
              {getStatusBadge(message.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-secondary-700">
                  <MessageSquare className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Type de message</p>
                    <p className="text-sm text-secondary-600 capitalize">
                      {message.messageType}
                    </p>
                  </div>
                </div>

                {message.eventTitle && (
                  <div className="flex items-center text-secondary-700">
                    <Calendar className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="font-medium">Événement associé</p>
                      <p className="text-sm text-secondary-600">
                        {message.eventTitle}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-secondary-700">
                  <Users className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Destinataires</p>
                    <p className="text-sm text-secondary-600">
                      {message.totalRecipients || 0} destinataire(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-secondary-700">
                  <Clock className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Créé le</p>
                    <p className="text-sm text-secondary-600">
                      {format(new Date(message.createdAt), 'PPP à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                {message.scheduledAt && (
                  <div className="flex items-center text-secondary-700">
                    <Calendar className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="font-medium">Programmé pour</p>
                      <p className="text-sm text-secondary-600">
                        {format(new Date(message.scheduledAt), 'PPP à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}

                {message.sentAt && (
                  <div className="flex items-center text-secondary-700">
                    <Send className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="font-medium">Envoyé le</p>
                      <p className="text-sm text-secondary-600">
                        {format(new Date(message.sentAt), 'PPP à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-secondary-100">
              <h3 className="font-medium text-secondary-700 mb-2">Contenu du message</h3>
              <div className="bg-secondary-50 rounded-lg p-4">
                <p className="text-sm text-secondary-900 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          {sends.length > 0 && (
            <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
              <div className="px-6 py-4 border-b border-secondary-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900">
                    Détails d'envoi ({sends.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    {sends.filter(s => s.status === 'failed').length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRetryFailed}
                        leftIcon={<RefreshCw className="h-4 w-4" />}
                      >
                        Réessayer les échecs
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      Exporter
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {sends.map((send) => (
                    <div
                      key={send.id}
                      className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {send.firstName?.charAt(0) || send.recipientEmail.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-secondary-900">
                              {send.firstName} {send.lastName}
                            </p>
                            {getSendStatusBadge(send.status)}
                          </div>
                          <p className="text-sm text-secondary-600">
                            {send.recipientEmail}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {send.sentAt && (
                          <p className="text-xs text-secondary-500">
                            Envoyé: {format(new Date(send.sentAt), 'dd/MM HH:mm')}
                          </p>
                        )}
                        {send.deliveredAt && (
                          <p className="text-xs text-success-600">
                            Livré: {format(new Date(send.deliveredAt), 'dd/MM HH:mm')}
                          </p>
                        )}
                        {send.readAt && (
                          <p className="text-xs text-primary-600">
                            Lu: {format(new Date(send.readAt), 'dd/MM HH:mm')}
                          </p>
                        )}
                        {send.errorMessage && (
                          <p className="text-xs text-error-600" title={send.errorMessage}>
                            Erreur
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Statistics */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Statistiques d'envoi
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Total envoyé</span>
                <span className="font-semibold text-secondary-900">
                  {analytics.sent}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Livré</span>
                <span className="font-semibold text-success-600">
                  {analytics.delivered}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Lu/Ouvert</span>
                <span className="font-semibold text-primary-600">
                  {analytics.read}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Échecs</span>
                <span className="font-semibold text-error-600">
                  {analytics.failed}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-secondary-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    {deliveryRate}%
                  </div>
                  <div className="text-xs text-secondary-500">
                    Taux de livraison
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {openRate}%
                  </div>
                  <div className="text-xs text-secondary-500">
                    Taux d'ouverture
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-100">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              💡 Insights
            </h3>
            
            <div className="space-y-3 text-sm">
              {deliveryRate >= 95 && (
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-success-600 mr-2 mt-0.5" />
                  <span className="text-success-700">
                    Excellent taux de livraison !
                  </span>
                </div>
              )}
              
              {openRate >= 25 && (
                <div className="flex items-start">
                  <Eye className="h-4 w-4 text-primary-600 mr-2 mt-0.5" />
                  <span className="text-primary-700">
                    Bon taux d'ouverture
                  </span>
                </div>
              )}
              
              {analytics.failed > 0 && (
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-warning-600 mr-2 mt-0.5" />
                  <span className="text-warning-700">
                    Vérifiez les adresses en échec
                  </span>
                </div>
              )}
              
              {openRate < 15 && analytics.read > 0 && (
                <div className="flex items-start">
                  <MessageSquare className="h-4 w-4 text-secondary-600 mr-2 mt-0.5" />
                  <span className="text-secondary-700">
                    Optimisez votre ligne d'objet
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Actions rapides
            </h3>
            
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={handleDuplicateMessage}
                leftIcon={<Copy className="h-4 w-4" />}
              >
                Dupliquer ce message
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Download className="h-4 w-4" />}
              >
                Télécharger le rapport
              </Button>
              
              {message.status === 'draft' && (
                <Button
                  as={Link}
                  to={`/messages/${message.id}/edit`}
                  variant="outline"
                  fullWidth
                  leftIcon={<Edit className="h-4 w-4" />}
                >
                  Modifier le message
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

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
            <span className="font-semibold">{message.subject}</span> ?
            Cette action est irréversible et supprimera également tout l'historique d'envoi.
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
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { MessageDetailPage };
export default MessageDetailPage;