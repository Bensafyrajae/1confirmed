import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Mail, 
  Building, 
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  UserX,
  UserCheck,
  Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { Modal } from '@/components/UI/Modal';
import { Recipient } from '@/types';
import { recipientService } from '@/services/recipientService';

const RecipientsPage: React.FC = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState<Recipient | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    loadRecipients();
    loadTags();
  }, [searchTerm, selectedTag, pagination.page]);

  const loadRecipients = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (searchTerm) {
        const searchResults = await recipientService.search(searchTerm);
        response = {
          recipients: searchResults,
          total: searchResults.length,
          page: 1,
          totalPages: 1,
        };
      } else if (selectedTag !== 'all') {
        const tagResults = await recipientService.getByTags([selectedTag]);
        response = {
          recipients: tagResults,
          total: tagResults.length,
          page: 1,
          totalPages: 1,
        };
      } else {
        response = await recipientService.getAll({
          page: pagination.page,
          limit: 20,
        });
      }

      setRecipients(response.recipients || []);
      setPagination({
        page: response.page || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
      });
    } catch (error) {
      toast.error('Erreur lors du chargement des destinataires');
      console.error('Error loading recipients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await recipientService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectRecipient = (recipientId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    } else {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecipients(recipients.map(r => r.id));
    } else {
      setSelectedRecipients([]);
    }
  };

  const handleDeleteRecipient = async () => {
    if (!recipientToDelete) return;

    try {
      await recipientService.delete(recipientToDelete.id);
      toast.success('Destinataire supprimé avec succès');
      setShowDeleteModal(false);
      setRecipientToDelete(null);
      loadRecipients();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecipients.length === 0) return;

    try {
      await recipientService.bulkDelete(selectedRecipients);
      toast.success(`${selectedRecipients.length} destinataire(s) supprimé(s)`);
      setSelectedRecipients([]);
      loadRecipients();
    } catch (error) {
      toast.error('Erreur lors de la suppression en masse');
    }
  };

  const handleOptOut = async (recipient: Recipient) => {
    try {
      await recipientService.optOut(recipient.id);
      toast.success('Destinataire désabonné');
      loadRecipients();
    } catch (error) {
      toast.error('Erreur lors du désabonnement');
    }
  };

  const handleOptIn = async (recipient: Recipient) => {
    try {
      await recipientService.optIn(recipient.id);
      toast.success('Destinataire réabonné');
      loadRecipients();
    } catch (error) {
      toast.error('Erreur lors du réabonnement');
    }
  };

  const handleExport = async () => {
    try {
      await recipientService.export({
        active: true,
        format: 'csv',
      });
      toast.success('Export en cours de téléchargement');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const result = await recipientService.importFromCSV(file, {
        skipHeader: true,
      });
      
      toast.success(
        `Import terminé: ${result.success} ajoutés, ${result.duplicates} doublons, ${result.failed} erreurs`
      );
      
      setShowImportModal(false);
      loadRecipients();
    } catch (error) {
      toast.error('Erreur lors de l\'import');
    }
  };

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
            Destinataires
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Gérez votre base de données de contacts
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Importer
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
          <Button
            as={Link}
            to="/recipients/new"
            leftIcon={<Plus className="h-4 w-4" />}
            size="lg"
          >
            Ajouter un destinataire
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl border border-secondary-100 shadow-soft"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Rechercher un destinataire..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          
          <div>
            <select
              value={selectedTag}
              onChange={(e) => handleTagFilter(e.target.value)}
              className="form-select w-full"
            >
              <option value="all">Tous les tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {selectedRecipients.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Supprimer ({selectedRecipients.length})
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Recipients Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : recipients.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <Users className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">
            Aucun destinataire trouvé
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            {searchTerm || selectedTag !== 'all'
              ? 'Aucun destinataire ne correspond à vos critères.'
              : 'Commencez par ajouter vos premiers destinataires.'
            }
          </p>
          <div className="mt-6">
            <Button
              as={Link}
              to="/recipients/new"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Ajouter un destinataire
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-secondary-100 shadow-soft overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">
                    <input
                      type="checkbox"
                      checked={
                        recipients.length > 0 && 
                        selectedRecipients.length === recipients.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="form-checkbox"
                    />
                  </th>
                  <th className="table-header-cell">Nom</th>
                  <th className="table-header-cell">Email</th>
                  <th className="table-header-cell">Entreprise</th>
                  <th className="table-header-cell">Tags</th>
                  <th className="table-header-cell">Statut</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {recipients.map((recipient, index) => (
                  <motion.tr
                    key={recipient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="table-row"
                  >
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(recipient.id)}
                        onChange={(e) => handleSelectRecipient(recipient.id, e.target.checked)}
                        className="form-checkbox"
                      />
                    </td>
                    
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-700">
                            {recipient.firstName?.charAt(0) || recipient.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <Link
                            to={`/recipients/${recipient.id}`}
                            className="font-medium text-secondary-900 hover:text-primary-600"
                          >
                            {recipient.firstName} {recipient.lastName}
                          </Link>
                          {recipient.position && (
                            <p className="text-sm text-secondary-500">
                              {recipient.position}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-secondary-400 mr-2" />
                        <a
                          href={`mailto:${recipient.email}`}
                          className="text-primary-600 hover:text-primary-500"
                        >
                          {recipient.email}
                        </a>
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      {recipient.company ? (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-secondary-400 mr-2" />
                          {recipient.company}
                        </div>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    
                    <td className="table-cell">
                      {recipient.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {recipient.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-block px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {recipient.tags.length > 2 && (
                            <span className="text-xs text-secondary-500">
                              +{recipient.tags.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-secondary-400">-</span>
                      )}
                    </td>
                    
                    <td className="table-cell">
                      {recipient.optOut ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
                          <UserX className="w-3 h-3 mr-1" />
                          Désabonné
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Actif
                        </span>
                      )}
                    </td>
                    
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/recipients/${recipient.id}`}
                          className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        <Link
                          to={`/recipients/${recipient.id}/edit`}
                          className="p-2 text-secondary-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        
                        {recipient.optOut ? (
                          <button
                            onClick={() => handleOptIn(recipient)}
                            className="p-2 text-secondary-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                            title="Réabonner"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOptOut(recipient)}
                            className="p-2 text-secondary-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                            title="Désabonner"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setRecipientToDelete(recipient);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3 border-t border-secondary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-700">
                    Affichage de{' '}
                    <span className="font-medium">
                      {((pagination.page - 1) * 20) + 1}
                    </span>{' '}
                    à{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * 20, pagination.total)}
                    </span>{' '}
                    sur{' '}
                    <span className="font-medium">{pagination.total}</span> résultats
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le destinataire"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Êtes-vous sûr de vouloir supprimer le destinataire{' '}
            <span className="font-semibold">
              {recipientToDelete?.firstName} {recipientToDelete?.lastName}
            </span> ?
            Cette action est irréversible.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRecipient}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importer des destinataires"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary-600 mb-4">
              Importez vos destinataires depuis un fichier CSV. 
              Le fichier doit contenir les colonnes : email, firstName, lastName, company, position.
            </p>
            
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-secondary-400" />
              <p className="mt-2 text-sm text-secondary-600">
                Glissez-déposez votre fichier CSV ici ou{' '}
                <label className="text-primary-600 hover:text-primary-500 cursor-pointer">
                  cliquez pour sélectionner
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImport(file);
                      }
                    }}
                  />
                </label>
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await recipientService.getImportTemplate();
                  toast.success('Template téléchargé');
                } catch (error) {
                  toast.error('Erreur lors du téléchargement');
                }
              }}
            >
              Télécharger le template
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowImportModal(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { RecipientsPage };
export default RecipientsPage;