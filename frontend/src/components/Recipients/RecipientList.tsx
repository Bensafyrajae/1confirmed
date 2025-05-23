import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, TagIcon } from '@heroicons/react/24/outline';
import { Recipient } from '../../types/recipient';
import RecipientCard from './RecipientCard';
import { Button } from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

interface RecipientListProps {
  onCreateRecipient?: () => void;
  onEditRecipient?: (recipient: Recipient) => void;
  onDeleteRecipient?: (recipient: Recipient) => void;
  onToggleOptOut?: (recipient: Recipient) => void;
  showActions?: boolean;
}

const RecipientList: React.FC<RecipientListProps> = ({
  onCreateRecipient,
  onEditRecipient,
  onDeleteRecipient,
  onToggleOptOut,
  showActions = false,
}) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'opted_out'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'company' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Mock data - À remplacer par des appels API réels
  useEffect(() => {
    const mockRecipients: Recipient[] = [
      {
        id: '1',
        user_id: 'user1',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+33 1 23 45 67 89',
        company: 'TechCorp',
        position: 'Développeur Senior',
        tags: ['VIP', 'Client'],
        notes: 'Client important depuis 2020',
        is_active: true,
        opt_out: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        user_id: 'user1',
        email: 'marie.martin@company.fr',
        first_name: 'Marie',
        last_name: 'Martin',
        company: 'StartupXYZ',
        position: 'Chef de projet',
        tags: ['Partenaire', 'Collaborateur'],
        is_active: true,
        opt_out: false,
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-10T14:20:00Z',
      },
      {
        id: '3',
        user_id: 'user1',
        email: 'pierre.durand@gmail.com',
        first_name: 'Pierre',
        last_name: 'Durand',
        phone: '+33 6 12 34 56 78',
        tags: ['Prospect'],
        notes: 'Intéressé par nos services',
        is_active: false,
        opt_out: true,
        opt_out_date: '2024-01-08T16:45:00Z',
        created_at: '2024-01-05T09:15:00Z',
        updated_at: '2024-01-08T16:45:00Z',
      },
    ];

    setLoading(true);
    setTimeout(() => {
      setRecipients(mockRecipients);
      setLoading(false);
    }, 500);
  }, []);

  // Filtrer et trier les destinataires
  const filteredRecipients = recipients.filter(recipient => {
    // Filtre par recherche
    const matchesSearch = searchTerm === '' || 
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipient.company && recipient.company.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtre par statut
    const matchesStatus = activeFilter === 'all' ||
      (activeFilter === 'active' && recipient.is_active && !recipient.opt_out) ||
      (activeFilter === 'inactive' && !recipient.is_active) ||
      (activeFilter === 'opted_out' && recipient.opt_out);

    // Filtre par tags
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => recipient.tags.includes(tag));

    return matchesSearch && matchesStatus && matchesTags;
  });

  // Tous les tags disponibles
  const allTags = Array.from(new Set(recipients.flatMap(r => r.tags)));

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
  };

  if (loading && recipients.length === 0) {
    return <LoadingSpinner size="lg" center text="Chargement des destinataires..." />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des destinataires..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filtre par statut */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="opted_out">Désabonnés</option>
          </select>

          {/* Tri */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy as any);
              setSortOrder(newSortOrder as any);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="created_at-DESC">Plus récents</option>
            <option value="created_at-ASC">Plus anciens</option>
            <option value="name-ASC">Nom A-Z</option>
            <option value="name-DESC">Nom Z-A</option>
            <option value="email-ASC">Email A-Z</option>
            <option value="company-ASC">Entreprise A-Z</option>
          </select>

          {onCreateRecipient && (
            <Button
              onClick={onCreateRecipient}
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Ajouter
            </Button>
          )}
        </div>
      </div>

      {/* Filtres par tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            Tags:
          </span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Effacer
            </button>
          )}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{recipients.length}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {recipients.filter(r => r.is_active && !r.opt_out).length}
          </div>
          <div className="text-sm text-gray-500">Actifs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {recipients.filter(r => r.opt_out).length}
          </div>
          <div className="text-sm text-gray-500">Désabonnés</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {recipients.filter(r => r.company).length}
          </div>
          <div className="text-sm text-gray-500">Avec entreprise</div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Liste des destinataires */}
      {filteredRecipients.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun destinataire</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedTags.length > 0 || activeFilter !== 'all'
              ? 'Aucun destinataire ne correspond à vos critères de recherche.'
              : 'Commencez par ajouter vos premiers destinataires.'
            }
          </p>
          {onCreateRecipient && !searchTerm && selectedTags.length === 0 && activeFilter === 'all' && (
            <div className="mt-6">
              <Button
                onClick={onCreateRecipient}
                leftIcon={<PlusIcon className="h-4 w-4" />}
              >
                Ajouter un destinataire
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipients.map((recipient) => (
            <RecipientCard
              key={recipient.id}
              recipient={recipient}
              onEdit={onEditRecipient}
              onDelete={onDeleteRecipient}
              onToggleOptOut={onToggleOptOut}
              showActions={showActions}
            />
          ))}
        </div>
      )}

      {/* Indicateur de résultats */}
      {filteredRecipients.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            {filteredRecipients.length} destinataire{filteredRecipients.length > 1 ? 's' : ''} 
            {recipients.length !== filteredRecipients.length && ` sur ${recipients.length}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecipientList;