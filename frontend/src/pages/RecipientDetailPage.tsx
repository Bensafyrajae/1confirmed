import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Edit, 
  Trash2, 
  MessageSquare,
  Calendar,
  UserX,
  UserCheck,
  Activity,
  Tag,
  FileText,
  MoreVertical,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/UI/Button';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { Modal } from '@/components/UI/Modal';
import { Recipient } from '@/types';
import { recipientService } from '@/services/recipientService';

const RecipientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [engagement, setEngagement] = useState({
    totalMessages: 0,
    messagesOpened: 0,
    messagesClicked: 0,
    eventsAttended: 0,
    lastActivity: '',
    engagementScore: 0,
    timeline: [],
  });

  useEffect(() => {
    if (id) {
      loadRecipientDetails();
      loadEngagementData();
    }
  }, [id]);

  const loadRecipientDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const recipientData = await recipientService.getById(id);
      setRecipient(recipientData);
    } catch (error) {
      toast.error('Erreur lors du chargement du destinataire');
      navigate('/recipients');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEngagementData = async () => {
    if (!id) return;
    
    try {
      const analytics = await recipientService.getEngagementAnalytics(id);
      setEngagement(analytics);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    }
  };

  const handleDeleteRecipient = async () => {
    if (!id) return;

    try {
      await recipientService.delete(id);
      toast.success('Destinataire supprimé avec succès');
      navigate('/recipients');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleOptOut = async () => {
    if (!id || !recipient) return;

    try {
      await recipientService.optOut(id);
      setRecipient({ ...recipient, optOut: true });
      toast.success('Destinataire désabonné');
    } catch (error) {
      toast.error('Erreur lors du désabonnement');
    }
  };

  const handleOptIn = async () => {
    if (!id || !recipient) return;

    try {
      await recipientService.optIn(id);
      setRecipient({ ...recipient, optOut: false });
      toast.success('Destinataire réabonné');
    } catch (error) {
      toast.error('Erreur lors du réabonnement');
    }
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-success-600 bg-success-100' };
    if (score >= 60) return { level: 'Bon', color: 'text-primary-600 bg-primary-100' };
    if (score >= 40) return { level: 'Moyen', color: 'text-warning-600 bg-warning-100' };
    return { level: 'Faible', color: 'text-error-600 bg-error-100' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-error-400" />
        <h3 className="mt-2 text-sm font-medium text-secondary-900">
          Destinataire non trouvé
        </h3>
        <p className="mt-1 text-sm text-secondary-500">
          Le destinataire que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <div className="mt-6">
          <Button as={Link} to="/recipients">
            Retour aux destinataires
          </Button>
        </div>
      </div>
    );
  }

  const engagementData = getEngagementLevel(engagement.engagementScore);

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
            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-primary-700">
                {recipient.firstName?.charAt(0) || recipient.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {recipient.firstName} {recipient.lastName}
              </h1>
              <p className="text-sm text-secondary-600">
                {recipient.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageSquare className="h-4 w-4" />}
          >
            Envoyer un message
          </Button>
          <Button
            as={Link}
            to={`/recipients/${recipient.id}/edit`}
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
          {/* Contact Information */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-900">
                Informations de contact
              </h2>
              {recipient.optOut ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-error-100 text-error-800">
                  <UserX className="w-4 h-4 mr-2" />
                  Désabonné
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Actif
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-secondary-700">
                  <Mail className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href={`mailto:${recipient.email}`}
                      className="text-sm text-primary-600 hover:text-primary-500"
                    >
                      {recipient.email}
                    </a>
                  </div>
                </div>

                {recipient.phone && (
                  <div className="flex items-center text-secondary-700">
                    <Phone className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <a
                        href={`tel:${recipient.phone}`}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        {recipient.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-secondary-700">
                  <Calendar className="h-5 w-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Ajouté le</p>
                    <p className="text-sm text-secondary-600">
                      {format(new Date(recipient.createdAt), 'PPP', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {recipient.company && (
                  <div className="flex items-center text-secondary-700">
                    <Building className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="font-medium">Entreprise</p>
                      <p className="text-sm text-secondary-600">
                        {recipient.company}
                      </p>
                    </div>
                  </div>
                )}

                {recipient.position && (
                  <div className="flex items-center text-secondary-700">
                    <Briefcase className="h-5 w-5 mr-3 text-primary-500" />
                    <div>
                      <p className="font-medium">Poste</p>
                      <p className="text-sm text-secondary-600">
                        {recipient.position}
                      </p>
                    </div>
                  </div>
                )}

                {recipient.tags.length > 0 && (
                  <div className="flex items-start text-secondary-700">
                    <Tag className="h-5 w-5 mr-3 mt-0.5 text-primary-500" />
                    <div>
                      <p className="font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {recipient.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {recipient.notes && (
              <div className="mt-6 pt-6 border-t border-secondary-100">
                <div className="flex items-start text-secondary-700">
                  <FileText className="h-5 w-5 mr-3 mt-0.5 text-primary-500" />
                  <div>
                    <p className="font-medium mb-2">Notes</p>
                    <p className="text-sm text-secondary-600 whitespace-pre-wrap">
                      {recipient.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Engagement History */}
          <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
            <div className="px-6 py-4 border-b border-secondary-100">
              <h2 className="text-lg font-semibold text-secondary-900">
                Historique d'engagement
              </h2>
            </div>

            <div className="p-6">
              {engagement.timeline.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">
                    Aucune activité
                  </h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Ce destinataire n'a pas encore d'historique d'engagement.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {engagement.timeline.map((activity: any, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary-900">
                          {activity.event}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {format(new Date(activity.date), 'PPp', { locale: fr })}
                        </p>
                        {activity.details && (
                          <p className="text-xs text-secondary-600 mt-1">
                            {activity.details}
                          </p>
                        )}
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
                fullWidth
                leftIcon={<Send className="h-4 w-4" />}
              >
                Envoyer un message
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Calendar className="h-4 w-4" />}
              >
                Ajouter à un événement
              </Button>
              
              {recipient.optOut ? (
                <Button
                  variant="success"
                  fullWidth
                  onClick={handleOptIn}
                  leftIcon={<UserCheck className="h-4 w-4" />}
                >
                  Réabonner
                </Button>
              ) : (
                <Button
                  variant="warning"
                  fullWidth
                  onClick={handleOptOut}
                  leftIcon={<UserX className="h-4 w-4" />}
                >
                  Désabonner
                </Button>
              )}
            </div>
          </div>

          {/* Engagement Score */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Score d'engagement
            </h3>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-secondary-900 mb-1">
                {engagement.engagementScore}%
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${engagementData.color}`}>
                {engagementData.level}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Messages reçus</span>
                <span className="font-semibold text-secondary-900">
                  {engagement.totalMessages}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Messages ouverts</span>
                <span className="font-semibold text-success-600">
                  {engagement.messagesOpened}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Liens cliqués</span>
                <span className="font-semibold text-primary-600">
                  {engagement.messagesClicked}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Événements assistés</span>
                <span className="font-semibold text-warning-600">
                  {engagement.eventsAttended}
                </span>
              </div>
            </div>

            {engagement.lastActivity && (
              <div className="mt-4 pt-4 border-t border-secondary-100">
                <p className="text-xs text-secondary-500">
                  Dernière activité : {format(new Date(engagement.lastActivity), 'PPp', { locale: fr })}
                </p>
              </div>
            )}
          </div>

          {/* Contact Preferences */}
          <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Préférences de contact
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-primary-500 mr-2" />
                  <span className="text-sm text-secondary-700">Email</span>
                </div>
                <span className={`text-sm font-medium ${
                  recipient.optOut ? 'text-error-600' : 'text-success-600'
                }`}>
                  {recipient.optOut ? 'Désactivé' : 'Activé'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 text-whatsapp-500 mr-2" />
                  <span className="text-sm text-secondary-700">WhatsApp</span>
                </div>
                <span className="text-sm font-medium text-success-600">
                  {recipient.phone ? 'Disponible' : 'Non disponible'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-secondary-500 mr-2" />
                  <span className="text-sm text-secondary-700">SMS</span>
                </div>
                <span className="text-sm font-medium text-success-600">
                  {recipient.phone ? 'Disponible' : 'Non disponible'}
                </span>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-100">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Données & Confidentialité
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Consentement RGPD</span>
                <span className="font-medium text-success-600">✓ Donné</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-secondary-600">Dernière mise à jour</span>
                <span className="font-medium text-secondary-900">
                  {format(new Date(recipient.updatedAt), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-secondary-600">Source</span>
                <span className="font-medium text-secondary-900">
                  Manuel
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200">
              <Button
                variant="outline"
                size="sm"
                fullWidth
              >
                Exporter les données
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le destinataire"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Êtes-vous sûr de vouloir supprimer le destinataire{' '}
            <span className="font-semibold">
              {recipient.firstName} {recipient.lastName}
            </span> ?
            Cette action est irréversible et supprimera également tout l'historique associé.
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
              onClick={handleDeleteRecipient}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { RecipientDetailPage };
export default RecipientDetailPage;