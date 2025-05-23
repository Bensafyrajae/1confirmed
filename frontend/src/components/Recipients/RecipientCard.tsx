import React from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Recipient } from '../../types/recipient';
import { formatDate } from '../../utils/formatDate';
import { Button } from '../UI/Button';

interface RecipientCardProps {
  recipient: Recipient;
  onEdit?: (recipient: Recipient) => void;
  onDelete?: (recipient: Recipient) => void;
  onToggleOptOut?: (recipient: Recipient) => void;
  showActions?: boolean;
}

const RecipientCard: React.FC<RecipientCardProps> = ({ 
  recipient, 
  onEdit, 
  onDelete, 
  onToggleOptOut,
  showActions = false 
}) => {
  const fullName = `${recipient.first_name} ${recipient.last_name}`.trim() || 'Sans nom';
  const initials = (recipient.first_name?.charAt(0) || '') + (recipient.last_name?.charAt(0) || '') || 
                   recipient.email.charAt(0).toUpperCase();

  return (
    <div className={`card hover:shadow-md transition-shadow duration-200 ${
      !recipient.is_active ? 'opacity-60' : ''
    } ${recipient.opt_out ? 'border-yellow-200 bg-yellow-50' : ''}`}>
      <div className="card-body">
        {/* En-tête avec avatar et actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-primary-700">
                {initials}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {fullName}
              </h3>
              <div className="flex items-center space-x-2">
                {!recipient.is_active && (
                  <span className="badge badge-gray">Inactif</span>
                )}
                {recipient.opt_out && (
                  <span className="badge badge-warning flex items-center">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    Désabonné
                  </span>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(recipient)}
                  leftIcon={<PencilIcon className="h-4 w-4" />}
                >
                  Modifier
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(recipient)}
                  leftIcon={<TrashIcon className="h-4 w-4" />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Supprimer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Informations de contact */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <a 
              href={`mailto:${recipient.email}`}
              className="text-primary-600 hover:text-primary-700 truncate"
            >
              {recipient.email}
            </a>
          </div>

          {recipient.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <a 
                href={`tel:${recipient.phone}`}
                className="text-primary-600 hover:text-primary-700"
              >
                {recipient.phone}
              </a>
            </div>
          )}

          {recipient.company && (
            <div className="flex items-center text-sm text-gray-600">
              <BuildingOfficeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {recipient.company}
                {recipient.position && ` - ${recipient.position}`}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {recipient.tags && recipient.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {recipient.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {recipient.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                  +{recipient.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {recipient.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {recipient.notes}
            </p>
          </div>
        )}

        {/* Pied de card */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Ajouté le {formatDate(recipient.created_at)}
            </span>
            
            {onToggleOptOut && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleOptOut(recipient)}
                className={recipient.opt_out ? 'text-green-600 hover:text-green-700' : 'text-yellow-600 hover:text-yellow-700'}
              >
                {recipient.opt_out ? 'Réabonner' : 'Désabonner'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientCard;