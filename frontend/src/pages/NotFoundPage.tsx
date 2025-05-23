import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/UI/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-primary-600 opacity-20">
              404
            </h1>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Page non trouvée
            </h2>
            <p className="text-lg text-secondary-600 mb-6">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </p>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8"
          >
            <div className="mx-auto w-64 h-64 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
              <Search className="w-32 h-32 text-primary-400" />
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                to="/dashboard"
                size="lg"
                leftIcon={<Home className="h-5 w-5" />}
              >
                Retour à l'accueil
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                leftIcon={<ArrowLeft className="h-5 w-5" />}
              >
                Page précédente
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-8 pt-8 border-t border-secondary-200">
              <p className="text-sm text-secondary-500 mb-4">
                Liens utiles :
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  to="/events"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Événements
                </Link>
                <Link
                  to="/recipients"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Destinataires
                </Link>
                <Link
                  to="/messages"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Messages
                </Link>
                <Link
                  to="/settings"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Paramètres
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export { NotFoundPage };
export default NotFoundPage;