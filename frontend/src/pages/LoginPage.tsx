import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { LoginData } from '@/types';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, isLoading } = useAuth();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginData>();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      setError('root', {
        message: error.response?.message || 'Erreur de connexion',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center">
            <motion.div 
              className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Zap className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="mt-6 text-3xl font-bold text-secondary-900">
              Connectez-vous
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Accédez à votre plateforme EventSync
            </p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-secondary-100"
          >
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <Input
                {...register('email', {
                  required: 'Email requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email invalide',
                  },
                })}
                type="email"
                label="Adresse email"
                placeholder="votre@email.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                autoComplete="email"
                autoFocus
              />

              {/* Password */}
              <div className="relative">
                <Input
                  {...register('password', {
                    required: 'Mot de passe requis',
                    minLength: {
                      value: 6,
                      message: 'Au moins 6 caractères requis',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm"
                >
                  {errors.root.message}
                </motion.div>
              )}

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                size="lg"
              >
                Se connecter
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-600">
                Pas encore de compte ?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </motion.div>

          {/* WhatsApp Integration Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-whatsapp-50 border border-whatsapp-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-whatsapp-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-whatsapp-800">
                  Intégration WhatsApp Business
                </p>
                <p className="text-xs text-whatsapp-600 mt-1">
                  Envoyez des notifications via WhatsApp avec 1Confirmed
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export { LoginPage };
export default LoginPage;