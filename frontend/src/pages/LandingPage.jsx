import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Zap, 
  Target, 
  Timer, 
  BarChart3, 
  Trophy, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Beautiful landing page with hero section and feature highlights
 */
const LandingPage = () => {
  const features = [
    {
      icon: Target,
      title: '🎯 Laser-Focused Task Management',
      description: 'Master the art of focus with our 3-task daily limit. No more overwhelming to-do lists—just pure, concentrated productivity.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Timer,
      title: '⚡ Gamified Pomodoro Sessions',
      description: 'Turn time management into an adventure! Earn 25 XP per session and watch your productivity level soar.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BarChart3,
      title: '📊 Real-Time Progress Tracking',
      description: 'Unlock the secrets of your productivity patterns with beautiful analytics and distraction insights.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Trophy,
      title: '🏆 XP & Leveling System',
      description: 'Every task completed, every session finished—earn XP and level up your productivity game!',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Users,
      title: '🌟 Distraction Tracking',
      description: 'Identify your focus enemies! Track distractions in real-time and build stronger focus habits.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Sparkles,
      title: '✨ Stunning Glassmorphism UI',
      description: 'Experience productivity like never before with our beautiful, modern interface that makes work feel magical.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  const stats = [
    { number: '3', label: 'Daily Tasks Max', emoji: '🎯' },
    { number: '25', label: 'XP per Session', emoji: '⚡' },
    { number: '100', label: 'XP to Level Up', emoji: '🏆' },
    { number: '∞', label: 'Productivity Potential', emoji: '🚀' }
  ]

  const testimonials = [
    {
      name: 'Alex Rodriguez',
      role: 'Freelance Writer',
      content: '🎯 The 3-task limit is a game-changer! I finally stopped drowning in endless to-do lists and started actually completing things. My productivity has never been higher!',
      rating: 5
    },
    {
      name: 'Jordan Kim',
      role: 'Student',
      content: '⚡ Earning XP for Pomodoro sessions makes studying addictive in the best way possible. I actually look forward to my study sessions now!',
      rating: 5
    },
    {
      name: 'Casey Morgan',
      role: 'Remote Worker',
      content: '🌟 The distraction tracking opened my eyes to my focus patterns. I went from scattered to laser-focused in just one week!',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-focus-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-focus-500 to-focus-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FocusFlow</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="gradient">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Turn Work Into
              <span className="bg-gradient-to-r from-focus-500 to-indigo-600 bg-clip-text text-transparent"> Play</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              🎮 Master your productivity with gamified focus sessions, XP rewards, and real-time progress tracking. 
              <br className="hidden sm:block" />
              <span className="text-focus-600 dark:text-focus-400 font-semibold">Level up your life, one task at a time.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link to="/register">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto group">
                  🚀 Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.emoji}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-focus-600 dark:group-hover:text-focus-400 transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              🎮 Game-Changing Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform your daily grind into an epic quest for productivity mastery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="glass-card p-8 hover:scale-105 transition-all duration-300 group"
                >
                  <div className={cn(
                    "w-16 h-16 bg-gradient-to-r rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300",
                    feature.color
                  )}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              💬 Success Stories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real users, real results—see how FocusFlow transformed their productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-card p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              🚀 Ready to Level Up?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join the productivity revolution! Transform your work into an epic adventure with FocusFlow's 
              <span className="text-focus-600 dark:text-focus-400 font-semibold"> gamified approach to success</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button size="xl" variant="gradient" className="group">
                  🎮 Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">✨ No credit card required • Start instantly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-focus-500 to-focus-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">FocusFlow</span>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              © 2024 FocusFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
