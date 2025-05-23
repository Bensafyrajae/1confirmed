import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Recipient, CreateRecipientRequest } from '../../types/recipient';
import { useValidation, validationSchemas } from '../../utils/validation';

interface RecipientFormProps {
  recipient?: Recipient | null;
  onSubmit: (data: CreateRecipientRequest) => Promise<void>;
  onCancel: () => void;
}

const RecipientForm: React.FC<RecipientFormProps> = ({ recipient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateRecipientRequest>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    position: '',
    tags: [],
    notes: '',
    metadata: {},
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { validateForm, validateSingleField } = useValidation(validationSchemas.recipient);

  // Charger les données du destinataire pour l'édition
  useEffect(() => {
    if (recipient) {
      setFormData({
        email: recipient.email,
        firstName: recipient.first_name,
        lastName: recipient.last_name,
        phone: recipient.phone || '',
        company: recipient.company || '',
        position: recipient.position || '',
        tags: recipient.tags || [],
        notes: recipient.notes || '',
        metadata: recipient.metadata || {},
      });
    }
  }, [recipient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      {/* Email */}
      <div>
        <label htmlFor="email" className="label">
          Adresse email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`input ${errors.email ? 'input-error' : ''}`}
          placeholder="nom@example.com"
          disabled={!!recipient} // Email non modifiable en édition
        />
        {errors.email && <p className="error-message">{errors.email}</p>}
        {recipient && (
          <p className="mt-1 text-xs text-gray-500">
            L'adresse email ne peut pas être modifiée
          </p>
        )}
      </div>

      {/* Nom et Prénom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="label">
            Prénom
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`input ${errors.firstName ? 'input-error' : ''}`}
            placeholder="Prénom"
          />
          {errors.firstName && <p className="error-message">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="label">
            Nom
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`input ${errors.lastName ? 'input-error' : ''}`}
            placeholder="Nom"
          />
          {errors.lastName && <p className="error-message">{errors.lastName}</p>}
        </div>
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="phone" className="label">
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={`input ${errors.phone ? 'input-error' : ''}`}
          placeholder="+33 1 23 45 67 89"
        />
        {errors.phone && <p className="error-message">{errors.phone}</p>}
      </div>

      {/* Entreprise et Poste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company" className="label">
            Entreprise
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className={`input ${errors.company ? 'input-error' : ''}`}
            placeholder="Nom de l'entreprise"
          />
          {errors.company && <p className="error-message">{errors.company}</p>}
        </div>

        <div>
          <label htmlFor="position" className="label">
            Poste
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className={`input ${errors.position ? 'input-error' : ''}`}
            placeholder="Intitulé du poste"
          />
          {errors.position && <p className="error-message">{errors.position}</p>}
        </div>
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
            placeholder="Ajouter un tag (ex: VIP, Partenaire, Client)..."
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

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleInputChange}
          className="input"
          placeholder="Notes personnelles sur ce destinataire..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {recipient ? 'Modifier' : 'Ajouter'} le destinataire
        </Button>
      </div>
    </form>
  );
};

export default RecipientForm;