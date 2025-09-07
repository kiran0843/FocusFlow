import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Zap,
  Target,
  Timer,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Beautiful 404 page with modern design and helpful navigation
 */
const NotFoundPage = () => {
  const quickLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Your productivity overview'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: Target,
      description: 'Manage your daily tasks'
    },
    {
      name: 'Pomodoro',
      href: '/pomodoro',
      icon: Timer,
      description: 'Focus sessions'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Progress insights'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-focus-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            {/* 404 Animation */}
            <div className="relative mb-8">
              <div className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-focus-500 to-indigo-600 bg-clip-text animate-pulse">
                404
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-r from-focus-500 to-focus-600 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            {/* Error message */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Page Not Found
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Oops! The page you're looking for seems to have vanished into the digital void. 
              But don't worry, we'll help you get back on track!
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Link to="/dashboard">
                <Button size="xl" variant="gradient" className="w-full sm:w-auto">
                  <Home className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button 
                size="xl" 
                variant="glass" 
                className="w-full sm:w-auto"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
            </div>
          </div>

          {/* Quick links */}
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Quick Navigation
              </h2>
              <p className="text-white/70">
                Here are some popular pages you might be looking for
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <Link
                    key={index}
                    to={link.href}
                    className="group block"
                  >
                    <div className="glass-card p-6 text-center hover:scale-105 transition-all duration-300 group-hover:bg-white/20">
                      <div className="w-12 h-12 bg-gradient-to-r from-focus-500 to-focus-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">
                        {link.name}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Search suggestion */}
          <div className="mt-8 text-center">
            <div className="glass-card p-6 max-w-md mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <Search className="h-5 w-5 text-white/60" />
                <span className="text-white font-medium">Can't find what you're looking for?</span>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Try searching for it or contact our support team for help.
              </p>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all duration-200"
                />
                <Button variant="gradient" size="sm">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Fun facts */}
          <div className="mt-12 text-center">
            <div className="glass-card p-6 max-w-2xl mx-auto">
              <h3 className="text-white font-semibold mb-4">
                Did you know?
              </h3>
              <p className="text-white/70 text-sm">
                The term "404 error" comes from room 404 at CERN, where the original web servers were located. 
                The room was used to store the web's first server, and when pages couldn't be found, 
                people would say "check room 404" - hence the error code!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-focus-400/30 rounded-full animate-bounce delay-100"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-indigo-400/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce delay-500"></div>
      <div className="absolute bottom-20 right-10 w-5 h-5 bg-pink-400/30 rounded-full animate-bounce delay-700"></div>
    </div>
  )
}

export default NotFoundPage
