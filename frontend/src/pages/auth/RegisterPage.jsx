import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, Zap, Check, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { GlassInput } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/card'
import { cn, validatePassword } from '@/lib/utils'

/**
 * RegisterPage component with glassmorphism design
 */
const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm()

  const password = watch('password', '')
  const passwordValidation = validatePassword(password)

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const result = await registerUser(data.name, data.email, data.password)
      
      if (result.success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError('root', {
          type: 'manual',
          message: result.error
        })
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-focus-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
      </div>

      <div className="w-full max-w-md relative z-10">
        <GlassCard className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-focus-500 to-focus-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">FocusFlow</h1>
            </div>
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-white/70">Start your productivity journey today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white">
                Full Name
              </label>
              <GlassInput
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name cannot exceed 50 characters'
                  }
                })}
                className={cn(errors.name && 'border-red-400 focus:ring-red-400')}
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email Address
              </label>
              <GlassInput
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className={cn(errors.email && 'border-red-400 focus:ring-red-400')}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <GlassInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value) => {
                      const validation = validatePassword(value)
                      return validation.isValid || 'Password does not meet requirements'
                    }
                  })}
                  className={cn(
                    'pr-12',
                    errors.password && 'border-red-400 focus:ring-red-400'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          passwordValidation.score <= 2 && "bg-red-400 w-1/3",
                          passwordValidation.score === 3 && "bg-yellow-400 w-2/3",
                          passwordValidation.score >= 4 && "bg-green-400 w-full"
                        )}
                      />
                    </div>
                    <span className="text-xs text-white/60">
                      {passwordValidation.score <= 2 && "Weak"}
                      {passwordValidation.score === 3 && "Medium"}
                      {passwordValidation.score >= 4 && "Strong"}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {passwordValidation.feedback.map((feedback, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        {passwordValidation.score > index ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <X className="h-3 w-3 text-red-400" />
                        )}
                        <span className={cn(
                          passwordValidation.score > index ? "text-green-400" : "text-red-400"
                        )}>
                          {feedback}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                Confirm Password
              </label>
              <div className="relative">
                <GlassInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  className={cn(
                    'pr-12',
                    errors.confirmPassword && 'border-red-400 focus:ring-red-400'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Error message */}
            {errors.root && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                <p className="text-red-400 text-sm">{errors.root.message}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="gradient"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-white/60">Already have an account?</span>
              </div>
            </div>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full px-4 py-3 text-white font-medium bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default RegisterPage
