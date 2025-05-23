import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Message, CreateMessageRequest } from '../../types/message';
import { useValidation, validationSchemas } from '../../utils/validation';
import { MESSAGE_TYPES, MESSAGE_TYPE_LABELS } from '../../utils/constants';
import { CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface MessageFormProps {
  message?: Message | null;
  onSubmit: (data: CreateMessageRequest) => Promise<void>;
  onCancel: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ message, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateMessageRequest>({
    eventId: undefined,
    subject: '',
    content: '',
    messageType: 'email',
    scheduledAt: '',
    metadata: {},
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const { validateForm, validateSingleField } = useValidation(validationSchemas.message);

  // Charger les données du message pour l'édition
  useEffect(() => {
    if (message) {
      setFormData({
        eventId: message.event_id || undefined,
        subject: message.subject,
        content: message.content,
        messageType: message.message_type,
        scheduledAt: message.scheduled_at 
          ? new Date(message.scheduled_at).toISOString().slice(0, 16)
          : '',
        metadata: message.metadata || {},
      });
    }
  }, [message]);

  // Charger les événements et destinataires (mock data)
  useEffect(() => {
    // TODO: Remplacer par des appels API réels
    setEvents([
      { id: '1', title: 'Conférence Tech 2024', participant_count: 150 },
      { id: '2', title: 'Workshop React', participant_count: 30 },
      { id: '3', title: 'Meetup JavaScript', participant_count: 80 },
    ]);

    setRecipients([
      { id: '1', email: 'john@example.com', name: 'John Doe' },
      { id: '2', email: 'marie@example.com', name: 'Marie Martin' },
      { id: '3', email: 'pierre@example.com', name: 'Pierre Durand' },
    ]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Validation en temps réel
    if (errors[name]) {
      const error = validateSingleField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  const handleRecipientToggle = (recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (selectedRecipients.length === 0) {
      setErrors({ recipients: 'Veuillez sélectionner au moins un destinataire' });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        metadata: {
          ...formData.metadata,
          recipientIds: selectedRecipients,
        },
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      setFormData(prev => ({
        ...prev,
        content: before + variable + after,
      }));
      
      // Repositionner le curseur
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        textarea.focus();
      }, 0);
    }
  };

  const variables = [
    '{{first_name}}',
    '{{last_name}}',
    '{{email}}',
    '{{company}}',
    '{{event_title}}',
    '{{event_date}}',
    '{{event_location}}',
  ];

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              !previewMode
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Édition
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              previewMode
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Aperçu
          </button>
        </nav>
      </div>

      {previewMode ? (
        /* Mode aperçu */
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Aperçu du message</h3>
            
            <div className="bg-white rounded border p-4">
              <div className="border-b pb-2 mb-4">
                <p className="text-sm text-gray-600">Sujet:</p>
                <p className="font-medium">{formData.subject || 'Sans sujet'}</p>
              </div>
              
              <div className="prose max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formData.content.replace(/\n/g, '<br>') 
                  }} 
                />
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Type: {MESSAGE_TYPE_LABELS[formData.messageType]}</p>
              <p>Destinataires: {selectedRecipients.length} sélectionné(s)</p>
              {formData.scheduledAt && (
                <p>Programmé pour: {new Date(formData.scheduledAt).toLocaleString('fr-FR')}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mode édition */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Événement associé */}
          <div>
            <label htmlFor="eventId" className="label">
              Événement associé (optionnel)
            </label>
            <select
              id="eventId"
              name="eventId"
              value={formData.eventId || ''}
              onChange={handleInputChange}
              className="input"
            >
              <option value="">Aucun événement</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} ({event.participant_count} participants)
                </option>
              ))}
            </select>
          </div>

          {/* Type de message */}
          <div>
            <label htmlFor="messageType" className="label">
              Type de message
            </label>
            <select
              id="messageType"
              name="messageType"
              value={formData.messageType}
              onChange={handleInputChange}
              className="input"
            >
              {Object.entries(MESSAGE_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>

          {/* Sujet */}
          <div>
            <label htmlFor="subject" className="label">
              Sujet *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className={`input ${errors.subject ? 'input-error' : ''}`}
              placeholder="Entrez le sujet de votre message"
            />
            {errors.subject && <p className="error-message">{errors.subject}</p>}
          </div>

          {/* Variables */}
          <div>
            <label className="label">Variables disponibles</label>
            <div className="flex flex-wrap gap-2">
              {variables.map(variable => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded border text-gray-700"
                >
                  {variable}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cliquez sur une variable pour l'insérer dans le contenu
            </p>
          </div>

          {/* Contenu */}
          <div>
            <label htmlFor="content" className="label">
              Contenu *
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleInputChange}
              className={`input ${errors.content ? 'input-error' : ''}`}
              placeholder="Rédigez votre message ici..."
            />
            {errors.content && <p className="error-message">{errors.content}</p>}
          </div>

          {/* Programmation */}
          <div>
            <label htmlFor="scheduledAt" className="label">
              Programmer l'envoi (optionnel)
            </label>
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                className="input flex-1"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide pour envoyer immédiatement
            </p>
          </div>

          {/* Sélection des destinataires */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">
                <UserGroupIcon className="h-5 w-5 inline mr-2" />
                Destinataires *
              </label>
              <button
                type="button"
                onClick={handleSelectAllRecipients}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {selectedRecipients.length === recipients.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </button>
            </div>
            
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
              {recipients.map(recipient => (
                <label
                  key={recipient.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes(recipient.id)}
                    onChange={() => handleRecipientToggle(recipient.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                    <p className="text-xs text-gray-500">{recipient.email}</p>
                  </div>
                </label>
              ))}
            </div>
            
            {selectedRecipients.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedRecipients.length} destinataire(s) sélectionné(s)
              </p>
            )}
            
            {errors.recipients && <p className="error-message">{errors.recipients}</p>}
          </div>
        </form>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        {!previewMode && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(true)}
            >
              Aperçu
            </Button>
            <Button
              type="submit"
              loading={loading}
              onClick={handleSubmit}
            >
              {message ? 'Modifier' : 'Créer'} le message
            </Button>
          </>
        )}
        {previewMode && (
          <Button
            type="button"
            onClick={() => setPreviewMode(false)}
          >
            Retour à l'édition
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageForm;