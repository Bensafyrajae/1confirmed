import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Tag,
  Save,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { CreateRecipientData, Recipient } from '@/types';
import { recipientService } from '@/services/recipientService';

const RecipientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateRecipientData & { tags: string[] }>();

  useEffect(() => {
    if (isEditing) {
      loadRecipient();
    }
    loadAvailableTags();
  }, [id, isEditing]);

  const loadRecipient = async () => {
    if (!id) return;
    
    try {
      setInitialLoading(true);
      const recipient = await recipientService.getById(id);
      
      // Populate form with recipient data
      setValue('email', recipient.email);
      setValue('firstName', recipient.firstName || '');
      setValue('lastName', recipient.lastName || '');
      setValue('phone', recipient.phone || '');
      setValue('company', recipient.company || '');
      setValue('position', recipient.position || '');
      setValue('notes', recipient.notes || '');
      setValue('tags', recipient.tags || []);
    } catch (error) {
      toast.error('Erreur lors du chargement du destinataire');
      navigate('/recipients');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadAvailableTags = async () => {
    try {
      const tags = await recipientService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const onSubmit = async (data: CreateRecipientData & { tags: string[] }) => {
    try {
      setIsLoading(true);
      
      const recipientData: CreateRecipientData = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        position: data.position,
        notes: data.notes,
        tags: data.tags,
        metadata: {},
      };

      if (isEditing && id) {
        await recipientService.update(id, recipientData);
        toast.success('Destinataire mis à jour avec succès');
      } else {
        await recipientService.create(recipientData);
        toast.success('Destinataire créé avec succès');
      }

      navigate('/recipients');
    } catch (error: any) {
      const message = error.response?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const tagOptions = availableTags.map(tag => ({
    value: tag,
    label: tag,
  }));

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            {isEditing ? 'Modifier le destinataire' : 'Nouveau destinataire'}
          </h1>
          <p className="text-sm text-secondary-600">
            {isEditing ? 'Modifiez les informations du destinataire' : 'Ajoutez un nouveau destinataire à votre base'}
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
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Informations personnelles
              </h3>
              
              <div className="space-y-4">
                <Input
                  {...register('email', {
                    required: 'Email requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  label="Adresse email"
                  type="email"
                  placeholder="contact@example.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register('firstName')}
                    label="Prénom"
                    placeholder="John"
                    leftIcon={<User className="h-4 w-4" />}
                  />
                  
                  <Input
                    {...register('lastName')}
                    label="Nom"
                    placeholder="Doe"
                    leftIcon={<User className="h-4 w-4" />}
                  />
                </div>

                <Input
                  {...register('phone')}
                  label="Téléphone"
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  leftIcon={<Phone className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Informations professionnelles
              </h3>
              
              <div className="space-y-4">
                <Input
                  {...register('company')}
                  label="Entreprise"
                  placeholder="Nom de l'entreprise"
                  leftIcon={<Building className="h-4 w-4" />}
                />

                <Input
                  {...register('position')}
                  label="Poste"
                  placeholder="Directeur, Développeur, etc."
                  leftIcon={<Briefcase className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Informations supplémentaires
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="form-textarea w-full"
                  placeholder="Notes personnelles sur ce destinataire..."
                />
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
            {/* Tags */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Tags
              </h3>
              
              <Controller
                name="tags"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    options={tagOptions}
                    value={tagOptions.filter(option => field.value?.includes(option.value))}
                    onChange={(options) => field.onChange(options?.map(option => option.value) || [])}
                    placeholder="Ajouter des tags"
                    className="react-select"
                    classNamePrefix="react-select"
                    isCreatable
                  />
                )}
              />
              
              <p className="mt-2 text-xs text-secondary-500">
                Utilisez les tags pour organiser vos destinataires
              </p>
            </div>

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
                  {isEditing ? 'Mettre à jour' : 'Créer le destinataire'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/recipients')}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Aperçu
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-primary-700">
                  <User className="h-4 w-4 mr-2" />
                  {watch('firstName') || watch('lastName') 
                    ? `${watch('firstName')} ${watch('lastName')}`
                    : 'Nom non défini'
                  }
                </div>
                
                <div className="flex items-center text-primary-700">
                  <Mail className="h-4 w-4 mr-2" />
                  {watch('email') || 'Email non défini'}
                </div>
                
                {watch('company') && (
                  <div className="flex items-center text-primary-700">
                    <Building className="h-4 w-4 mr-2" />
                    {watch('company')}
                  </div>
                )}

                {watch('phone') && (
                  <div className="flex items-center text-primary-700">
                    <Phone className="h-4 w-4 mr-2" />
                    {watch('phone')}
                  </div>
                )}

                {watch('tags')?.length > 0 && (
                  <div className="flex items-start text-primary-700">
                    <Tag className="h-4 w-4 mr-2 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {watch('tags').map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-100">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                💡 Conseils
              </h3>
              
              <div className="space-y-2 text-sm text-secondary-700">
                <p>• Utilisez des tags pour segmenter vos destinataires</p>
                <p>• Ajoutez des notes pour personnaliser vos messages</p>
                <p>• Vérifiez l'email avant de sauvegarder</p>
                <p>• Les informations professionnelles aident au ciblage</p>
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
};

export { RecipientFormPage };
export default RecipientFormPage;