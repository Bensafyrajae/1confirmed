import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Tag,
  Save,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { CreateEventData, Event } from '@/types';
import { eventService } from '@/services/eventService';
import 'react-datepicker/dist/react-datepicker.css';

const EventFormPage: React.FC = () => {
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
  } = useForm<CreateEventData & { tags: string[] }>();

  const watchStatus = watch('status');

  useEffect(() => {
    if (isEditing) {
      loadEvent();
    }
    loadAvailableTags();
  }, [id, isEditing]);

  const loadEvent = async () => {
    if (!id) return;
    
    try {
      setInitialLoading(true);
      const event = await eventService.getById(id);
      
      // Populate form with event data
      setValue('title', event.title);
      setValue('description', event.description || '');
      setValue('eventDate', event.eventDate);
      setValue('location', event.location || '');
      setValue('status', event.status);
      setValue('maxParticipants', event.maxParticipants || undefined);
      setValue('isPublic', event.isPublic);
      setValue('registrationDeadline', event.registrationDeadline || '');
      setValue('tags', event.tags || []);
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'événement');
      navigate('/events');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadAvailableTags = async () => {
    try {
      // This would typically fetch existing tags from the API
      setAvailableTags(['Conférence', 'Workshop', 'Networking', 'Formation', 'Webinar']);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const onSubmit = async (data: CreateEventData & { tags: string[] }) => {
    try {
      setIsLoading(true);
      
      const eventData: CreateEventData = {
        title: data.title,
        description: data.description,
        eventDate: data.eventDate,
        location: data.location,
        status: data.status,
        maxParticipants: data.maxParticipants,
        isPublic: data.isPublic,
        registrationDeadline: data.registrationDeadline,
        tags: data.tags,
        metadata: {},
      };

      if (isEditing && id) {
        await eventService.update(id, eventData);
        toast.success('Événement mis à jour avec succès');
      } else {
        await eventService.create(eventData);
        toast.success('Événement créé avec succès');
      }

      navigate('/events');
    } catch (error: any) {
      const message = error.response?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndActivate = async (data: CreateEventData & { tags: string[] }) => {
    await onSubmit({ ...data, status: 'active' });
  };

  const statusOptions = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'active', label: 'Actif' },
  ];

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
            {isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h1>
          <p className="text-sm text-secondary-600">
            {isEditing ? 'Modifiez les détails de votre événement' : 'Créez un nouvel événement pour vos invités'}
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
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Informations générales
              </h3>
              
              <div className="space-y-4">
                <Input
                  {...register('title', {
                    required: 'Le titre est requis',
                    minLength: {
                      value: 3,
                      message: 'Le titre doit contenir au moins 3 caractères'
                    }
                  })}
                  label="Titre de l'événement"
                  placeholder="Ex: Conférence Tech 2024"
                  error={errors.title?.message}
                  leftIcon={<Calendar className="h-4 w-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="form-textarea w-full"
                    placeholder="Décrivez votre événement..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-error-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <Input
                  {...register('location')}
                  label="Lieu"
                  placeholder="Ex: Centre de conférences, Paris"
                  leftIcon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Date et heure
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Date et heure de l'événement *
                  </label>
                  <Controller
                    name="eventDate"
                    control={control}
                    rules={{ required: 'La date est requise' }}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date?.toISOString())}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        placeholderText="Sélectionner une date et heure"
                        className="form-input w-full"
                        minDate={new Date()}
                      />
                    )}
                  />
                  {errors.eventDate && (
                    <p className="mt-1 text-sm text-error-600">
                      {errors.eventDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Date limite d'inscription
                  </label>
                  <Controller
                    name="registrationDeadline"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date?.toISOString())}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        placeholderText="Optionnel"
                        className="form-input w-full"
                        minDate={new Date()}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Participants
              </h3>
              
              <div className="space-y-4">
                <Input
                  {...register('maxParticipants', {
                    min: {
                      value: 1,
                      message: 'Le nombre de participants doit être supérieur à 0'
                    }
                  })}
                  type="number"
                  label="Nombre maximum de participants"
                  placeholder="Laissez vide pour illimité"
                  leftIcon={<Users className="h-4 w-4" />}
                  error={errors.maxParticipants?.message}
                />

                <div className="flex items-center">
                  <input
                    {...register('isPublic')}
                    type="checkbox"
                    className="form-checkbox"
                  />
                  <label className="ml-2 text-sm text-secondary-700">
                    Événement public (visible dans les recherches)
                  </label>
                </div>
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
            {/* Status */}
            <div className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Statut
              </h3>
              
              <Controller
                name="status"
                control={control}
                defaultValue="draft"
                render={({ field }) => (
                  <Select
                    {...field}
                    options={statusOptions}
                    value={statusOptions.find(option => option.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                    placeholder="Sélectionner un statut"
                    className="react-select"
                    classNamePrefix="react-select"
                  />
                )}
              />
            </div>

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
                  />
                )}
              />
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
                  isLoading={isLoading && watchStatus === 'draft'}
                  leftIcon={<Save className="h-4 w-4" />}
                  disabled={isSubmitting}
                >
                  {isEditing ? 'Mettre à jour' : 'Enregistrer en brouillon'}
                </Button>

                {(!isEditing || watchStatus === 'draft') && (
                  <Button
                    type="button"
                    variant="success"
                    fullWidth
                    isLoading={isLoading && watchStatus === 'active'}
                    leftIcon={<Send className="h-4 w-4" />}
                    onClick={handleSubmit(handleSaveAndActivate)}
                    disabled={isSubmitting}
                  >
                    {isEditing ? 'Activer l\'événement' : 'Créer et activer'}
                  </Button>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Aperçu
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-primary-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  {watch('eventDate') 
                    ? format(new Date(watch('eventDate')), 'PPP à HH:mm', { locale: fr })
                    : 'Date non définie'
                  }
                </div>
                
                {watch('location') && (
                  <div className="flex items-center text-primary-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    {watch('location')}
                  </div>
                )}
                
                <div className="flex items-center text-primary-700">
                  <Users className="h-4 w-4 mr-2" />
                  {watch('maxParticipants') 
                    ? `Max ${watch('maxParticipants')} participants`
                    : 'Participants illimités'
                  }
                </div>

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
          </motion.div>
        </div>
      </form>
    </div>
  );
};

export { EventFormPage };
export default EventFormPage;