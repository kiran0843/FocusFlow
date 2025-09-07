import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNavigation from './MobileNavigation'
import { cn } from '@/lib/utils'

/**
 * Main layout component that wraps the entire application
 */
const Layout = ({ children }) => {
  const { user, loading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle scroll to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsHeaderVisible(true)
      } 
      // Hide header when scrolling down (but not on mobile to avoid conflicts)
      else if (currentScrollY > lastScrollY && currentScrollY > 100 && window.innerWidth >= 1024) {
        setIsHeaderVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-focus-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-100">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
      />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-64 glass-sidebar z-40 lg:hidden transition-transform duration-300 mobile-menu",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          isCollapsed={false} 
          onToggle={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Header */}
        <div className={cn(
          "fixed top-0 right-0 left-0 z-30 transition-transform duration-300",
          sidebarCollapsed ? "lg:left-16" : "lg:left-64",
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        )}>
          <Header 
            onMobileMenuToggle={toggleMobileMenu}
            isMobileMenuOpen={mobileMenuOpen}
          />
        </div>

        {/* Page Content */}
        <main className="p-6 pb-20 lg:pb-6 pt-20">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  )
}

export default Layout
