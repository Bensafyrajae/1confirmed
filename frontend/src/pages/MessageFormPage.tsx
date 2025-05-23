import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  MessageCircle,
  Calendar,
  Clock,
  Users,
  Save,
  Send,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { Modal } from '@/components/UI/Modal';
import { CreateMessageData, Message, Event, Recipient } from '@/types';
import { messageService } from '@/services/messageService';
import { eventService } from '@/services/eventService';
import { recipientService } from '@/services/recipientService';
import { whatsappService } from '@/services/whatsappService';

const MessageFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const eventId = searchParams.get('eventId');
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [events, setEvents] = useState<Event[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateMessageData & { 
    scheduledAt?: string;
    recipientIds?: string[];
    whatsappTemplate?: string;
  }>();

  const watchMessageType = watch('messageType');
  const watchSubject = watch('subject');
  const watchContent = watch('content');

  useEffect(() => {
    if (isEditing) {
      loadMessage();
    }
    loadEvents();
    loadRecipients();
    loadWhatsAppTemplates();
    
    // Set default event if coming from event page
    if (eventId) {
      setValue('eventId', eventId);
    }
  }, [id, isEditing, eventId]);

  const loadMessage = async () => {
    if (!id) return;
    
    try {
      setInitialLoading(true);
      const message = await messageService.getById(id);
      
      // Populate form with message data
      setValue('eventId', message.eventId || '');
      setValue('subject', message.subject);
      setValue('content', message.content);
      setValue('messageType', message.messageType);
      setValue('scheduledAt', message.scheduledAt || '');
    } catch (error) {
      toast.error('Erreur lors du chargement du message');
      navigate('/messages');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventService.getAll({ limit: 100 });
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadRecipients = async () => {
    try {
      const response = await recipientService.getAll({ limit: 200 });
      setRecipients(response.recipients || []);
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  };

  const loadWhatsAppTemplates = async () => {
    try {
      const templates = await whatsappService.getTemplates();
      setWhatsappTemplates(templates);
    } catch (error) {
      console.error('Error loading WhatsApp templates:', error);
    }
  };

  const onSubmit = async (data: CreateMessageData & { 
    scheduledAt?: string;
    recipientIds?: string[];
  }) => {
    try {
      setIsLoading(true);
      
      const messageData: CreateMessageData = {
        eventId: data.eventId || undefined,
        subject: data.subject,
        content: data.content,
        messageType: data.messageType,
        scheduledAt: data.scheduledAt || undefined,
        metadata: {},
      };

      if (isEditing && id) {
        await messageService.update(id, messageData);
        toast.success('Message mis à jour avec succès');
      } else {
        await messageService.create(messageData);
        toast.success('Message créé avec succès');
      }

      navigate('/messages');
    } catch (error: any) {
      const message = error.response?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!id || selectedRecipients.length === 0) return;

    try {
      setIsLoading(true);
      await messageService.send(id, { recipientIds: selectedRecipients });
      toast.success(`Message envoyé à ${selectedRecipients.length} destinataire(s)`);
      setShowSendModal(false);
      navigate('/messages');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setIsLoading(false);
    }
  };

  const messageTypeOptions = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: Phone },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'push', label: 'Push', icon: MessageSquare },
  ];

  const eventOptions = events.map(event => ({
    value: event.id,
    label: event.title,
  }));

  const recipientOptions = recipients.map(recipient => ({
    value: recipient.id,
    label: `${recipient.firstName} ${recipient.lastName} (${recipient.email})`,
  }));

  const whatsappTemplateOptions = whatsappTemplates.map(template => ({
    value: template.name,
    label: template.name,
  }));

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
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
            {isEditing ? 'Modifier le message' : 'Nouveau message'}
          </h1>
          <p className="text-sm text-secondary-600">
            {isEditing ? 'Modifiez votre campagne de communication' : 'Créez une nouvelle campagne de communication'}
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Message Type & Event */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Configuration du message
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Type de message *
                  </label>
                  <Controller
                    name="messageType"
                    control={control}
                    defaultValue="email"
                    rules={{ required: 'Type de message requis' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={messageTypeOptions.map(option => ({
                          value: option.value,
                          label: (
                            <div className="flex items-center">
                              <option.icon className="h-4 w-4 mr-2" />
                              {option.label}
                            </div>
                          ),
                        }))}
                        value={messageTypeOptions.find(option => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        placeholder="Sélectionner un type"
                        className="react-select"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                  {errors.messageType && (
                    <p className="mt-1 text-sm text-error-600">
                      {errors.messageType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Événement associé
                  </label>
                  <Controller
                    name="eventId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={[
                          { value: '', label: 'Aucun événement' },
                          ...eventOptions
                        ]}
                        value={eventOptions.find(option => option.value === field.value) || { value: '', label: 'Aucun événement' }}
                        onChange={(option) => field.onChange(option?.value || '')}
                        placeholder="Sélectionner un événement"
                        className="react-select"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Template (if WhatsApp selected) */}
            {watchMessageType === 'whatsapp' && (
              <div className="bg-whatsapp-50 border border-whatsapp-200 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-whatsapp-900 mb-4">
                  Template WhatsApp Business
                </h3>
                
                <div className="space-y-4">
                  <Controller
                    name="whatsappTemplate"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={whatsappTemplateOptions}
                        value={whatsappTemplateOptions.find(option => option.value === field.value)}
                        onChange={(option) => field.onChange(option?.value)}
                        placeholder="Sélectionner un template WhatsApp"
                        className="react-select"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                  
                  <div className="bg-whatsapp-100 p-4 rounded-lg">
                    <p className="text-sm text-whatsapp-800">
                      <strong>Note :</strong> Les messages WhatsApp Business doivent utiliser des templates 
                      pré-approuvés par WhatsApp. Les templates sont gérés via votre compte 1Confirmed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Contenu du message
              </h3>
              
              <div className="space-y-4">
                <Input
                  {...register('subject', {
                    required: 'Sujet requis',
                    minLength: {
                      value: 3,
                      message: 'Le sujet doit contenir au moins 3 caractères'
                    }
                  })}
                  label="Sujet"
                  placeholder="Objet de votre message"
                  error={errors.subject?.message}
                  leftIcon={<MessageSquare className="h-4 w-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Contenu *
                  </label>
                  <textarea
                    {...register('content', {
                      required: 'Contenu requis',
                      minLength: {
                        value: 10,
                        message: 'Le contenu doit contenir au moins 10 caractères'
                      }
                    })}
                    rows={8}
                    className="form-textarea w-full"
                    placeholder="Rédigez votre message..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-error-600">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                {/* Variables disponibles */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-primary-900 mb-2">
                    Variables disponibles :
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {'{{firstName}}'}
                    </span>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {'{{lastName}}'}
                    </span>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {'{{email}}'}
                    </span>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {'{{company}}'}
                    </span>
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {'{{eventTitle}}'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Programmation
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Programmer l'envoi
                </label>
                <Controller
                  name="scheduledAt"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date?.toISOString())}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="Optionnel - Envoyer maintenant"
                      className="form-input w-full"
                      minDate={new Date()}
                    />
                  )}
                />
                <p className="mt-1 text-xs text-secondary-500">
                  Laissez vide pour envoyer immédiatement
                </p>
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
            {/* Actions */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<Save className="h-4 w-4" />}
                  disabled={isSubmitting}
                >
                  {isEditing ? 'Mettre à jour' : 'Enregistrer le message'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setShowPreview(true)}
                  leftIcon={<Eye className="h-4 w-4" />}
                >
                  Aperçu
                </Button>

                {isEditing && (
                  <Button
                    type="button"
                    variant="success"
                    fullWidth
                    onClick={() => setShowSendModal(true)}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Envoyer le message
                  </Button>
                )}
              </div>
            </div>

            {/* Recipients Preview */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Destinataires
              </h3>
              
              <div className="text-center py-4">
                <Users className="mx-auto h-8 w-8 text-secondary-400" />
                <p className="mt-2 text-sm text-secondary-600">
                  {isEditing ? 'Sélectionnez les destinataires lors de l\'envoi' : 'Les destinataires seront sélectionnés après la création'}
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Aperçu rapide
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-primary-800">Type</p>
                  <p className="text-sm text-primary-700">
                    {messageTypeOptions.find(t => t.value === watchMessageType)?.label || 'Non défini'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-primary-800">Sujet</p>
                  <p className="text-sm text-primary-700">
                    {watchSubject || 'Non défini'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-primary-800">Contenu</p>
                  <p className="text-sm text-primary-700 line-clamp-3">
                    {watchContent || 'Non défini'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </form>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Aperçu du message"
        size="lg"
      >
        <div className="space-y-4">
          <div className="border border-secondary-200 rounded-lg p-4">
            <div className="border-b border-secondary-200 pb-2 mb-4">
              <h4 className="font-semibold text-secondary-900">
                {watchSubject || 'Sujet du message'}
              </h4>
              <p className="text-sm text-secondary-600">
                De: EventSync &lt;no-reply@eventsync.com&gt;
              </p>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">
                {watchContent || 'Contenu du message...'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowPreview(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Send Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Envoyer le message"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Sélectionnez les destinataires pour ce message :
          </p>
          
          <Select
            isMulti
            options={recipientOptions}
            value={recipientOptions.filter(option => selectedRecipients.includes(option.value))}
            onChange={(options) => setSelectedRecipients(options?.map(option => option.value) || [])}
            placeholder="Sélectionner les destinataires"
            className="react-select"
            classNamePrefix="react-select"
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowSendModal(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={selectedRecipients.length === 0}
              isLoading={isLoading}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Envoyer à {selectedRecipients.length} destinataire(s)
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { MessageFormPage };
export default MessageFormPage;