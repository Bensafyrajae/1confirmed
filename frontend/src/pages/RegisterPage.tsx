import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Building, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { RegisterData } from '@/types';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, user, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterData & { confirmPassword: string }>();

  const watchPassword = watch('password');

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (error: any) {
      setError('root', {
        message: error.response?.message || 'Erreur lors de l\'inscription',
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
              Créer un compte
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Rejoignez EventSync et gérez vos événements
            </p>
          </div>

          {/* Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-secondary-100"
          >
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('firstName', {
                    required: 'Prénom requis',
                    minLength: {
                      value: 2,
                      message: 'Au moins 2 caractères',
                    },
                  })}
                  type="text"
                  label="Prénom"
                  placeholder="Votre prénom"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.firstName?.message}
                  autoComplete="given-name"
                />

                <Input
                  {...register('lastName', {
                    required: 'Nom requis',
                    minLength: {
                      value: 2,
                      message: 'Au moins 2 caractères',
                    },
                  })}
                  type="text"
                  label="Nom"
                  placeholder="Votre nom"
                  error={errors.lastName?.message}
                  autoComplete="family-name"
                />
              </div>

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
              />

              {/* Company Name */}
              <Input
                {...register('companyName', {
                  required: 'Nom de l\'entreprise requis',
                })}
                type="text"
                label="Nom de l'entreprise"
                placeholder="Votre entreprise"
                leftIcon={<Building className="h-4 w-4" />}
                error={errors.companyName?.message}
                autoComplete="organization"
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
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Doit contenir au moins une majuscule, une minuscule et un chiffre',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  autoComplete="new-password"
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

              {/* Confirm Password */}
              <Input
                {...register('confirmPassword', {
                  required: 'Confirmation du mot de passe requise',
                  validate: (value) =>
                    value === watchPassword || 'Les mots de passe ne correspondent pas',
                })}
                type={showPassword ? 'text' : 'password'}
                label="Confirmer le mot de passe"
                placeholder="Confirmez votre mot de passe"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />

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

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('acceptTerms', {
                      required: 'Vous devez accepter les conditions',
                    })}
                    type="checkbox"
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-secondary-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="text-secondary-600">
                    J'accepte les{' '}
                    <Link
                      to="/terms"
                      className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                      conditions d'utilisation
                    </Link>{' '}
                    et la{' '}
                    <Link
                      to="/privacy"
                      className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                      politique de confidentialité
                    </Link>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-error-600 text-xs mt-1">
                      {errors.acceptTerms.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                size="lg"
              >
                Créer mon compte
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-600">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Se connecter
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
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-3 h-3 bg-whatsapp-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-whatsapp-800">
                  Intégration WhatsApp Business incluse
                </p>
                <p className="text-xs text-whatsapp-600 mt-1">
                  Envoyez des invitations et notifications directement via WhatsApp grâce à notre partenariat avec 1Confirmed
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export { RegisterPage };
export default RegisterPage;