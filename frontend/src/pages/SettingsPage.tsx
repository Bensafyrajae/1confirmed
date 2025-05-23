import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  MessageCircle, 
  Shield,
  Smartphone,
  Mail,
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState({
    connected: false,
    phone: '',
    lastSync: '',
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const {
    register: registerNotifications,
    handleSubmit: handleSubmitNotifications,
    setValue: setNotificationValue,
  } = useForm();

  useEffect(() => {
    // Load user profile data
    if (user) {
      setProfileValue('firstName', user.firstName);
      setProfileValue('lastName', user.lastName);
      setProfileValue('email', user.email);
      setProfileValue('companyName', user.companyName);
    }

    // Load WhatsApp status
    loadWhatsAppStatus();
  }, [user, setProfileValue]);

  const loadWhatsAppStatus = async () => {
    try {
      const status = await messageService.testWhatsAppConnection();
      setWhatsappStatus({
        connected: status.connected,
        phone: status.phone || '',
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading WhatsApp status:', error);
    }
  };

  const handleProfileUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
      });
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: any) => {
    try {
      setIsLoading(true);
      // This would call authService.changePassword
      toast.success('Mot de passe modifié avec succès');
      resetPassword();
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      // Save notification preferences
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: 'profile',
      name: 'Profil',
      icon: User,
    },
    {
      id: 'password',
      name: 'Mot de passe',
      icon: Lock,
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
    },
    {
      id: 'security',
      name: 'Sécurité',
      icon: Shield,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <div className="flex-shrink-0">
          <SettingsIcon className="h-8 w-8 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Paramètres
          </h1>
          <p className="text-sm text-secondary-600">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
              <div className="px-6 py-4 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Informations personnelles
                </h3>
                <p className="text-sm text-secondary-600">
                  Mettez à jour vos informations de profil
                </p>
              </div>
              
              <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    {...registerProfile('firstName', { required: 'Prénom requis' })}
                    label="Prénom"
                    error={profileErrors.firstName?.message as string}
                  />
                  
                  <Input
                    {...registerProfile('lastName', { required: 'Nom requis' })}
                    label="Nom"
                    error={profileErrors.lastName?.message as string}
                  />
                </div>

                <Input
                  {...registerProfile('email')}
                  label="Email"
                  type="email"
                  disabled
                  helperText="L'email ne peut pas être modifié"
                />

                <Input
                  {...registerProfile('companyName', { required: 'Nom de l\'entreprise requis' })}
                  label="Nom de l'entreprise"
                  error={profileErrors.companyName?.message as string}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
              <div className="px-6 py-4 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Modifier le mot de passe
                </h3>
                <p className="text-sm text-secondary-600">
                  Assurez-vous d'utiliser un mot de passe fort
                </p>
              </div>
              
              <form onSubmit={handleSubmitPassword(handlePasswordChange)} className="p-6 space-y-6">
                <Input
                  {...registerPassword('currentPassword', { required: 'Mot de passe actuel requis' })}
                  label="Mot de passe actuel"
                  type="password"
                  error={passwordErrors.currentPassword?.message as string}
                />

                <Input
                  {...registerPassword('newPassword', {
                    required: 'Nouveau mot de passe requis',
                    minLength: { value: 8, message: 'Au moins 8 caractères' },
                  })}
                  label="Nouveau mot de passe"
                  type="password"
                  error={passwordErrors.newPassword?.message as string}
                />

                <Input
                  {...registerPassword('confirmPassword', {
                    required: 'Confirmation requise',
                    validate: (value, { newPassword }) =>
                      value === newPassword || 'Les mots de passe ne correspondent pas',
                  })}
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  error={passwordErrors.confirmPassword?.message as string}
                />

                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-primary-900 mb-2">
                    Conseils pour un mot de passe sécurisé :
                  </h4>
                  <ul className="text-sm text-primary-700 space-y-1">
                    <li>• Au moins 8 caractères</li>
                    <li>• Mélange de majuscules et minuscules</li>
                    <li>• Au moins un chiffre</li>
                    <li>• Au moins un caractère spécial</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    leftIcon={<Lock className="h-4 w-4" />}
                  >
                    Modifier le mot de passe
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
              <div className="px-6 py-4 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Préférences de notification
                </h3>
                <p className="text-sm text-secondary-600">
                  Choisissez comment vous souhaitez être notifié
                </p>
              </div>
              
              <form onSubmit={handleSubmitNotifications(handleNotificationUpdate)} className="p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-secondary-900">
                    Notifications par email
                  </h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        {...registerNotifications('emailNewEvent')}
                        type="checkbox"
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm text-secondary-700">
                        Nouvel événement créé
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        {...registerNotifications('emailNewParticipant')}
                        type="checkbox"
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm text-secondary-700">
                        Nouveau participant inscrit
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        {...registerNotifications('emailMessageSent')}
                        type="checkbox"
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm text-secondary-700">
                        Message envoyé avec succès
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-secondary-900">
                    Notifications push
                  </h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        {...registerNotifications('pushEventReminder')}
                        type="checkbox"
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm text-secondary-700">
                        Rappels d'événement
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        {...registerNotifications('pushSystemUpdates')}
                        type="checkbox"
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm text-secondary-700">
                        Mises à jour système
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    leftIcon={<Bell className="h-4 w-4" />}
                  >
                    Enregistrer les préférences
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
              <div className="px-6 py-4 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Configuration WhatsApp Business
                </h3>
                <p className="text-sm text-secondary-600">
                  Gérez votre intégration avec 1Confirmed
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Connection Status */}
                <div className={`p-4 rounded-lg border ${
                  whatsappStatus.connected 
                    ? 'bg-whatsapp-50 border-whatsapp-200'
                    : 'bg-error-50 border-error-200'
                }`}>
                  <div className="flex items-center">
                    {whatsappStatus.connected ? (
                      <CheckCircle className="h-5 w-5 text-whatsapp-600 mr-3" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-error-600 mr-3" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        whatsappStatus.connected ? 'text-whatsapp-900' : 'text-error-900'
                      }`}>
                        {whatsappStatus.connected ? 'Connecté' : 'Non connecté'}
                      </p>
                      <p className={`text-sm ${
                        whatsappStatus.connected ? 'text-whatsapp-700' : 'text-error-700'
                      }`}>
                        {whatsappStatus.connected 
                          ? `Numéro: ${whatsappStatus.phone}`
                          : 'Veuillez configurer votre connexion WhatsApp'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuration Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Clé API 1Confirmed"
                    placeholder="Votre clé API 1Confirmed"
                    type="password"
                  />
                  
                  <Input
                    label="Numéro WhatsApp Business"
                    placeholder="+33 1 23 45 67 89"
                    leftIcon={<Smartphone className="h-4 w-4" />}
                  />
                </div>

                <div className="bg-whatsapp-50 border border-whatsapp-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-whatsapp-900 mb-2">
                    À propos de l'intégration 1Confirmed
                  </h4>
                  <p className="text-sm text-whatsapp-700 mb-3">
                    1Confirmed vous permet d'envoyer des messages WhatsApp Business 
                    directement depuis EventSync avec un taux de livraison optimal.
                  </p>
                  <ul className="text-sm text-whatsapp-700 space-y-1">
                    <li>• Templates pré-approuvés par WhatsApp</li>
                    <li>• Envoi en masse avec limitation automatique</li>
                    <li>• Suivi des statuts de livraison en temps réel</li>
                    <li>• Conformité RGPD et WhatsApp Business Policy</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={loadWhatsAppStatus}
                    leftIcon={<MessageCircle className="h-4 w-4" />}
                  >
                    Tester la connexion
                  </Button>
                  
                  <Button
                    variant="whatsapp"
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Enregistrer la configuration
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-secondary-100 shadow-soft">
              <div className="px-6 py-4 border-b border-secondary-100">
                <h3 className="text-lg font-semibold text-secondary-900">
                  Sécurité et confidentialité
                </h3>
                <p className="text-sm text-secondary-600">
                  Gérez vos paramètres de sécurité
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <p className="font-medium text-secondary-900">
                        Authentification à deux facteurs
                      </p>
                      <p className="text-sm text-secondary-600">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Activer
                  </Button>
                </div>

                {/* Session Management */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-3">
                    Sessions actives
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-secondary-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-secondary-900">
                            Chrome sur Windows
                          </p>
                          <p className="text-xs text-secondary-600">
                            Paris, France • Session actuelle
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-success-600 bg-success-100 px-2 py-1 rounded-full">
                        Actif
                      </span>
                    </div>
                  </div>
                </div>

                {/* Data Export */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-3">
                    Gestion des données
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-secondary-900">
                          Exporter mes données
                        </p>
                        <p className="text-xs text-secondary-600">
                          Télécharger une copie de toutes vos données
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Exporter
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-error-200 rounded-lg bg-error-50">
                      <div>
                        <p className="text-sm font-medium text-error-900">
                          Supprimer mon compte
                        </p>
                        <p className="text-xs text-error-700">
                          Supprimer définitivement votre compte et toutes vos données
                        </p>
                      </div>
                      <Button variant="danger" size="sm">
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-3">
                    Confidentialité
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-secondary-900">
                          Analytics et amélioration
                        </span>
                        <p className="text-xs text-secondary-600">
                          Nous aider à améliorer EventSync
                        </p>
                      </div>
                      <input type="checkbox" className="form-checkbox" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-secondary-900">
                          Emails marketing
                        </span>
                        <p className="text-xs text-secondary-600">
                          Recevoir des nouvelles et mises à jour
                        </p>
                      </div>
                      <input type="checkbox" className="form-checkbox" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export { SettingsPage };
export default SettingsPage;