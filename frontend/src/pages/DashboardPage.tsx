import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Stats, Event, Message, Recipient } from '../types';
import { eventService } from '../services/eventService';
import { messageService } from '../services/messageService';
import { recipientService } from '../services/recipientService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({});
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentRecipients, setRecentRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [
        eventStats,
        messageStats,
        recipientStats,
        upcomingEventsData,
        recentMessagesData,
        recentRecipientsData,
      ] = await Promise.all([
        eventService.getStats(),
        messageService.getStats(),
        recipientService.getStats(),
        eventService.getUpcoming(5),
        messageService.getAll({ limit: 5 }),
        recipientService.getRecentlyAdded(5),
      ]);

      setStats({
        events: eventStats,
        messages: messageStats,
        recipients: recipientStats,
      });
      
      setUpcomingEvents(upcomingEventsData);
      setRecentMessages(recentMessagesData.messages || []);
      setRecentRecipients(recentRecipientsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Événements',
      value: stats.events?.total || 0,
      subtitle: `${stats.events?.upcoming || 0} à venir`,
      icon: Calendar,
      color: 'bg-primary-500',
      href: '/events',
    },
    {
      title: 'Destinataires',
      value: stats.recipients?.total || 0,
      subtitle: `${stats.recipients?.active || 0} actifs`,
      icon: Users,
      color: 'bg-success-500',
      href: '/recipients',
    },
    {
      title: 'Messages',
      value: stats.messages?.totalMessages || 0,
      subtitle: `${stats.messages?.sentMessages || 0} envoyés`,
      icon: MessageSquare,
      color: 'bg-warning-500',
      href: '/messages',
    },
    {
      title: 'Taux de réussite',
      value: stats.messages?.totalRecipients 
        ? Math.round(((stats.messages?.successfulSends || 0) / stats.messages.totalRecipients) * 100)
        : 0,
      subtitle: 'des envois',
      icon: TrendingUp,
      color: 'bg-secondary-500',
      href: '/analytics',
      isPercentage: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
              Bonjour, {user?.firstName} 👋
            </h2>
            <p className="mt-1 text-sm text-secondary-500">
              Voici un aperçu de votre activité EventSync
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
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((card, index) => (
          <Link
            key={card.title}
            to={card.href}
            className="relative group bg-white overflow-hidden shadow-soft rounded-xl border border-secondary-100 hover:shadow-medium transition-all duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-lg p-3 group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      {card.title}
                    </dt>
                    <dd>
                      <div className="text-lg font-semibold text-secondary-900">
                        {card.value}{card.isPercentage ? '%' : ''}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-secondary-500">{card.subtitle}</div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-soft rounded-xl border border-secondary-100"
        >
          <div className="px-6 py-4 border-b border-secondary-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">
                Événements à venir
              </h3>
              <Link
                to="/events"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                Voir tout
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">
                  Aucun événement à venir
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Créez votre premier événement pour commencer.
                </p>
                <div className="mt-6">
                  <Button
                    as={Link}
                    to="/events/new"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Créer un événement
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block p-3 rounded-lg border border-secondary-100 hover:bg-secondary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-secondary-900">
                          {event.title}
                        </h4>
                        <p className="text-xs text-secondary-500 mt-1">
                          {format(new Date(event.eventDate), 'PPP', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'active' 
                            ? 'bg-success-100 text-success-800'
                            : 'bg-warning-100 text-warning-800'
                        }`}>
                          {event.status === 'active' ? 'Actif' : 'Brouillon'}
                        </span>
                        <Clock className="h-4 w-4 text-secondary-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white shadow-soft rounded-xl border border-secondary-100"
        >
          <div className="px-6 py-4 border-b border-secondary-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-secondary-900">
                Messages récents
              </h3>
              <Link
                to="/messages"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
              >
                Voir tout
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentMessages.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">
                  Aucun message
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  Créez votre premier message pour commencer.
                </p>
                <div className="mt-6">
                  <Button
                    as={Link}
                    to="/messages/new"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Créer un message
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((message) => (
                  <Link
                    key={message.id}
                    to={`/messages/${message.id}`}
                    className="block p-3 rounded-lg border border-secondary-100 hover:bg-secondary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-secondary-900 truncate">
                          {message.subject}
                        </h4>
                        <p className="text-xs text-secondary-500 mt-1">
                          {format(new Date(message.createdAt), 'PPp', { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          message.status === 'sent' 
                            ? 'bg-success-100 text-success-800'
                            : message.status === 'draft'
                            ? 'bg-secondary-100 text-secondary-800'
                            : message.status === 'scheduled'
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-error-100 text-error-800'
                        }`}>
                          {message.status === 'sent' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {message.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                          {message.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {message.status === 'sending' && <Send className="w-3 h-3 mr-1" />}
                          {message.status === 'sent' ? 'Envoyé' :
                           message.status === 'draft' ? 'Brouillon' :
                           message.status === 'scheduled' ? 'Programmé' :
                           message.status === 'sending' ? 'En cours' : 'Échec'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Recipients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white shadow-soft rounded-xl border border-secondary-100"
      >
        <div className="px-6 py-4 border-b border-secondary-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-900">
              Destinataires récents
            </h3>
            <Link
              to="/recipients"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
            >
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentRecipients.length === 0 ? (
            <div className="text-center py-6">
              <Users className="mx-auto h-12 w-12 text-secondary-400" />
              <h3 className="mt-2 text-sm font-medium text-secondary-900">
                Aucun destinataire
              </h3>
              <p className="mt-1 text-sm text-secondary-500">
                Ajoutez vos premiers destinataires pour commencer.
              </p>
              <div className="mt-6">
                <Button
                  as={Link}
                  to="/recipients/new"
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Ajouter un destinataire
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentRecipients.map((recipient) => (
                <Link
                  key={recipient.id}
                  to={`/recipients/${recipient.id}`}
                  className="block p-3 rounded-lg border border-secondary-100 hover:bg-secondary-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {recipient.firstName?.charAt(0) || recipient.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {recipient.firstName} {recipient.lastName}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">
                        {recipient.email}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* WhatsApp Integration Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-whatsapp-50 border border-whatsapp-200 rounded-xl p-6"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-whatsapp-500 rounded-full animate-pulse-soft"></div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-whatsapp-800">
              Intégration WhatsApp Business
            </h3>
            <p className="text-sm text-whatsapp-600 mt-1">
              Votre plateforme est connectée à 1Confirmed. Vous pouvez envoyer des notifications WhatsApp directement depuis EventSync.
            </p>
          </div>
          <div className="ml-4">
            <Button
              variant="whatsapp"
              size="sm"
              as={Link}
              to="/settings/whatsapp"
            >
              Configurer
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export { DashboardPage };
export default DashboardPage;