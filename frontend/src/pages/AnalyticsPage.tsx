import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Calendar,
  Target,
  Eye,
  MousePointer,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { eventService } from '../services/eventService';
import { messageService } from '../services/messageService';
import { recipientService } from '../services/recipientService';

const AnalyticsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalEvents: 0,
      totalMessages: 0,
      totalRecipients: 0,
      deliveryRate: 0,
    },
    eventTrends: [],
    messageTrends: [],
    channelDistribution: [],
    recipientGrowth: [],
    engagement: {
      opened: 0,
      clicked: 0,
      bounced: 0,
    }
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'week':
          startDate = subDays(endDate, 7);
          break;
        case 'month':
          startDate = startOfMonth(endDate);
          break;
        case 'quarter':
          startDate = subDays(endDate, 90);
          break;
        default:
          startDate = startOfMonth(endDate);
      }

      // Load data from services
      const [eventStats, messageStats, recipientStats] = await Promise.all([
        eventService.getStats(),
        messageService.getStats(),
        recipientService.getStats(),
      ]);

      // Mock analytics data (in real app, this would come from API)
      const mockEventTrends = Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(endDate, 29 - i), 'dd/MM'),
        events: Math.floor(Math.random() * 10) + 1,
        participants: Math.floor(Math.random() * 50) + 10,
      }));

      const mockMessageTrends = Array.from({ length: 30 }, (_, i) => ({
        date: format(subDays(endDate, 29 - i), 'dd/MM'),
        sent: Math.floor(Math.random() * 100) + 20,
        delivered: Math.floor(Math.random() * 80) + 15,
        opened: Math.floor(Math.random() * 40) + 5,
      }));

      const mockChannelDistribution = [
        { name: 'Email', value: 45, color: '#3B82F6' },
        { name: 'WhatsApp', value: 30, color: '#25D366' },
        { name: 'SMS', value: 20, color: '#10B981' },
        { name: 'Push', value: 5, color: '#F59E0B' },
      ];

      const mockRecipientGrowth = Array.from({ length: 12 }, (_, i) => ({
        month: format(subDays(endDate, (11 - i) * 30), 'MMM'),
        total: 1000 + i * 150 + Math.floor(Math.random() * 100),
        new: 150 + Math.floor(Math.random() * 50),
      }));

      setAnalytics({
        overview: {
          totalEvents: eventStats?.total || 0,
          totalMessages: messageStats?.totalMessages || 0,
          totalRecipients: recipientStats?.total || 0,
          deliveryRate: messageStats?.totalRecipients 
            ? Math.round(((messageStats.successfulSends || 0) / messageStats.totalRecipients) * 100)
            : 0,
        },
        eventTrends: mockEventTrends,
        messageTrends: mockMessageTrends,
        channelDistribution: mockChannelDistribution,
        recipientGrowth: mockRecipientGrowth,
        engagement: {
          opened: 65,
          clicked: 23,
          bounced: 8,
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ElementType;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`${color} rounded-lg p-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-secondary-500 truncate">
              {title}
            </dt>
            <dd>
              <div className="text-lg font-semibold text-secondary-900">
                {value}
              </div>
              {change && (
                <div className="text-sm text-success-600">
                  {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            Analytics
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Suivez les performances de vos événements et campagnes
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="form-select"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">Ce mois</option>
            <option value="quarter">3 derniers mois</option>
          </select>
          <Button
            variant="outline"
            onClick={loadAnalytics}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Actualiser
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Événements totaux"
          value={analytics.overview.totalEvents}
          change="+12% ce mois"
          icon={Calendar}
          color="bg-primary-500"
        />
        <StatCard
          title="Messages envoyés"
          value={analytics.overview.totalMessages}
          change="+8% ce mois"
          icon={MessageSquare}
          color="bg-success-500"
        />
        <StatCard
          title="Destinataires"
          value={analytics.overview.totalRecipients}
          change="+15% ce mois"
          icon={Users}
          color="bg-warning-500"
        />
        <StatCard
          title="Taux de livraison"
          value={`${analytics.overview.deliveryRate}%`}
          change="+2% ce mois"
          icon={Target}
          color="bg-secondary-500"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Tendance des événements
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.eventTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="events" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="participants" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Message Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Performance des messages
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.messageTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="delivered" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="opened" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Canaux de communication
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.channelDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.channelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {analytics.channelDistribution.map((channel, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: channel.color }}
                  />
                  <span className="text-sm text-secondary-700">{channel.name}</span>
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  {channel.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-4 w-4 text-primary-500 mr-2" />
                <span className="text-sm text-secondary-700">Taux d'ouverture</span>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-secondary-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${analytics.engagement.opened}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  {analytics.engagement.opened}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MousePointer className="h-4 w-4 text-success-500 mr-2" />
                <span className="text-sm text-secondary-700">Taux de clic</span>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-secondary-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: `${analytics.engagement.clicked}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  {analytics.engagement.clicked}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-warning-500 mr-2" />
                <span className="text-sm text-secondary-700">Taux de rebond</span>
              </div>
              <div className="flex items-center">
                <div className="w-20 bg-secondary-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-warning-500 h-2 rounded-full"
                    style={{ width: `${analytics.engagement.bounced}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-secondary-900">
                  {analytics.engagement.bounced}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-secondary-100">
            <h4 className="text-sm font-medium text-secondary-900 mb-3">
              Actions recommandées
            </h4>
            <div className="space-y-2 text-sm text-secondary-600">
              <p>• Optimiser les lignes d'objet pour améliorer l'ouverture</p>
              <p>• Personnaliser le contenu pour augmenter les clics</p>
              <p>• Nettoyer la liste pour réduire les rebonds</p>
            </div>
          </div>
        </motion.div>

        {/* Recipient Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Croissance des destinataires
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.recipientGrowth.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="new" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* WhatsApp Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-whatsapp-50 border border-whatsapp-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-whatsapp-900">
              Analytics WhatsApp Business
            </h3>
            <p className="text-sm text-whatsapp-700">
              Performances de vos campagnes WhatsApp via 1Confirmed
            </p>
          </div>
          <div className="w-3 h-3 bg-whatsapp-500 rounded-full animate-pulse-soft"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-whatsapp-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-whatsapp-600">Messages WhatsApp</p>
                <p className="text-2xl font-bold text-whatsapp-900">1,247</p>
              </div>
              <MessageSquare className="h-8 w-8 text-whatsapp-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-whatsapp-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-whatsapp-600">Taux de livraison</p>
                <p className="text-2xl font-bold text-whatsapp-900">97%</p>
              </div>
              <Target className="h-8 w-8 text-whatsapp-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-whatsapp-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-whatsapp-600">Taux de lecture</p>
                <p className="text-2xl font-bold text-whatsapp-900">89%</p>
              </div>
              <Eye className="h-8 w-8 text-whatsapp-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-whatsapp-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-whatsapp-600">Réponses</p>
                <p className="text-2xl font-bold text-whatsapp-900">234</p>
              </div>
              <TrendingUp className="h-8 w-8 text-whatsapp-500" />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-whatsapp-100 rounded-lg">
          <p className="text-sm text-whatsapp-800">
            <strong>Performance exceptionnelle :</strong> Vos campagnes WhatsApp affichent 
            un taux d'engagement 3x supérieur aux emails traditionnels grâce à l'intégration 1Confirmed.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export { AnalyticsPage };
export default AnalyticsPage;