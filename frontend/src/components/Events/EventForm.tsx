import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Event, CreateEventRequest } from '../../types/event';
import { useValidation, validationSchemas } from '../../utils/validation';
import { EVENT_STATUS } from '../../utils/constants';

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: CreateEventRequest) => Promise<void>;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    status: 'draft',
    maxParticipants: undefined,
    isPublic: false,
    registrationDeadline: '',
    tags: [],
    metadata: {},
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { validateForm, validateSingleField } = useValidation(validationSchemas.event);

  // Charger les données de l'événement pour l'édition
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        eventDate: new Date(event.event_date).toISOString().slice(0, 16),
        location: event.location || '',
        status: event.status,
        maxParticipants: event.max_participants,
        isPublic: event.is_public,
        registrationDeadline: event.registration_deadline 
          ? new Date(event.registration_deadline).toISOString().slice(0, 16)
          : '',
        tags: event.tags || [],
        metadata: event.metadata || {},
      });
    }
  }, [event]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value ? Number(value) : undefined) : value,
    }));

    // Validation en temps réel
    if (errors[name]) {
      const error = validateSingleField(name, type === 'checkbox' ? checked : value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Titre */}
      <div>
        <label htmlFor="title" className="label">
          Titre de l'événement *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`input ${errors.title ? 'input-error' : ''}`}
          placeholder="Entrez le titre de votre événement"
        />
        {errors.title && <p className="error-message">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          className="input"
          placeholder="Décrivez votre événement..."
        />
      </div>

      {/* Date et heure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventDate" className="label">
            Date et heure *
          </label>
          <input
            type="datetime-local"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleInputChange}
            className={`input ${errors.eventDate ? 'input-error' : ''}`}
          />
          {errors.eventDate && <p className="error-message">{errors.eventDate}</p>}
        </div>

        <div>
          <label htmlFor="registrationDeadline" className="label">
            Date limite d'inscription
          </label>
          <input
            type="datetime-local"
            id="registrationDeadline"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleInputChange}
            className="input"
          />
        </div>
      </div>

      {/* Lieu */}
      <div>
        <label htmlFor="location" className="label">
          Lieu
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="input"
          placeholder="Adresse ou nom du lieu"
        />
      </div>

      {/* Statut et paramètres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="label">
            Statut
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="input"
          >
            <option value={EVENT_STATUS.DRAFT}>Brouillon</option>
            <option value={EVENT_STATUS.ACTIVE}>Actif</option>
            <option value={EVENT_STATUS.COMPLETED}>Terminé</option>
            <option value={EVENT_STATUS.CANCELLED}>Annulé</option>
          </select>
        </div>

        <div>
          <label htmlFor="maxParticipants" className="label">
            Nombre maximum de participants
          </label>
          <input
            type="number"
            id="maxParticipants"
            name="maxParticipants"
            value={formData.maxParticipants || ''}
            onChange={handleInputChange}
            className="input"
            min="1"
            placeholder="Illimité"
          />
        </div>
      </div>

      {/* Événement public */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleInputChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
          Événement public (visible par tous)
        </label>
      </div>

      {/* Tags */}
      <div>
        <label className="label">
          Tags
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            className="input flex-1"
            placeholder="Ajouter un tag..."
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
          >
            Ajouter
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {event ? 'Modifier' : 'Créer'} l'événement
        </Button>
      </div>
    </form>
  );
};

export default EventForm;