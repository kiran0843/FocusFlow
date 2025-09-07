import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, AlertTriangle, Eye, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * DistractionPatterns - Visualization component for distraction patterns
 */
const DistractionPatterns = ({ 
  distractions = [], 
  className = '' 
}) => {
  const [timeRange, setTimeRange] = useState('week')
  const [activeTab, setActiveTab] = useState('overview')

  // Process distraction data for visualization
  const processDistractionData = () => {
    if (!distractions.length) return { patterns: {}, stats: {} }

    const now = new Date()
    const timeRanges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    }

    const filteredDistractions = distractions.filter(d => 
      new Date(d.timestamp) >= new Date(now.getTime() - timeRanges[timeRange])
    )

    // Hourly patterns
    const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
      totalDuration: 0,
      averageSeverity: 0
    }))

    // Daily patterns
    const dailyPatterns = Array.from({ length: 7 }, (_, day) => ({
      day,
      count: 0,
      totalDuration: 0,
      averageSeverity: 0
    }))

    // Type patterns
    const typePatterns = {}
    const contextPatterns = {}
    const sourcePatterns = {}

    filteredDistractions.forEach(distraction => {
      const date = new Date(distraction.timestamp)
      const hour = date.getHours()
      const day = date.getDay()

      // Hourly patterns
      hourlyPatterns[hour].count++
      hourlyPatterns[hour].totalDuration += distraction.duration || 0
      hourlyPatterns[hour].averageSeverity += distraction.severity || 0

      // Daily patterns
      dailyPatterns[day].count++
      dailyPatterns[day].totalDuration += distraction.duration || 0
      dailyPatterns[day].averageSeverity += distraction.severity || 0

      // Type patterns
      const type = distraction.type || 'other'
      if (!typePatterns[type]) {
        typePatterns[type] = { count: 0, totalDuration: 0, averageSeverity: 0 }
      }
      typePatterns[type].count++
      typePatterns[type].totalDuration += distraction.duration || 0
      typePatterns[type].averageSeverity += distraction.severity || 0

      // Context patterns
      const context = distraction.context || 'other'
      if (!contextPatterns[context]) {
        contextPatterns[context] = { count: 0, totalDuration: 0 }
      }
      contextPatterns[context].count++
      contextPatterns[context].totalDuration += distraction.duration || 0

      // Source patterns
      const source = distraction.source || 'external'
      if (!sourcePatterns[source]) {
        sourcePatterns[source] = { count: 0, totalDuration: 0 }
      }
      sourcePatterns[source].count++
      sourcePatterns[source].totalDuration += distraction.duration || 0
    })

    // Calculate averages
    hourlyPatterns.forEach(pattern => {
      if (pattern.count > 0) {
        pattern.averageSeverity = Math.round((pattern.averageSeverity / pattern.count) * 10) / 10
      }
    })

    dailyPatterns.forEach(pattern => {
      if (pattern.count > 0) {
        pattern.averageSeverity = Math.round((pattern.averageSeverity / pattern.count) * 10) / 10
      }
    })

    Object.values(typePatterns).forEach(pattern => {
      if (pattern.count > 0) {
        pattern.averageSeverity = Math.round((pattern.averageSeverity / pattern.count) * 10) / 10
      }
    })

    // Calculate overall stats
    const totalDistractions = filteredDistractions.length
    const totalDuration = filteredDistractions.reduce((sum, d) => sum + (d.duration || 0), 0)
    const averageSeverity = totalDistractions > 0 
      ? Math.round((filteredDistractions.reduce((sum, d) => sum + (d.severity || 0), 0) / totalDistractions) * 10) / 10
      : 0
    const averageImpact = totalDistractions > 0
      ? Math.round((filteredDistractions.reduce((sum, d) => sum + (d.impact || 0), 0) / totalDistractions) * 10) / 10
      : 0

    return {
      patterns: {
        hourly: hourlyPatterns,
        daily: dailyPatterns,
        byType: typePatterns,
        byContext: contextPatterns,
        bySource: sourcePatterns
      },
      stats: {
        totalDistractions,
        totalDuration,
        averageSeverity,
        averageImpact,
        averageDuration: totalDistractions > 0 ? Math.round(totalDuration / totalDistractions) : 0
      }
    }
  }

  const { patterns, stats } = processDistractionData()

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hourNames = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  const getTypeIcon = (type) => {
    const icons = {
      phone: '📱',
      social_media: '📲',
      thoughts: '🧠',
      email: '📧',
      noise: '🔊',
      people: '👥',
      other: '❓'
    }
    return icons[type] || '❓'
  }

  const getTypeColor = (type) => {
    const colors = {
      phone: 'text-red-400',
      social_media: 'text-blue-400',
      thoughts: 'text-purple-400',
      email: 'text-orange-400',
      noise: 'text-yellow-400',
      people: 'text-green-400',
      other: 'text-gray-400'
    }
    return colors[type] || 'text-gray-400'
  }

  if (!distractions.length) {
    return (
      <Card className={cn("p-6 bg-white/10 backdrop-blur-md border-white/20", className)}>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-white/70 text-lg font-medium mb-2">No Distraction Data</h3>
          <p className="text-white/50 text-sm">
            Start logging distractions during your Pomodoro sessions to see patterns here.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-6 bg-white/10 backdrop-blur-md border-white/20", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold text-lg">Distraction Patterns</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          {['week', 'month', 'year'].map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              size="sm"
              variant={timeRange === range ? "default" : "ghost"}
              className={cn(
                "text-xs px-3 py-1",
                timeRange === range 
                  ? "bg-blue-500 text-white" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-white">{stats.totalDistractions}</div>
          <div className="text-white/60 text-xs">Total</div>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-white">{Math.round(stats.totalDuration / 60)}m</div>
          <div className="text-white/60 text-xs">Total Duration</div>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-white">{stats.averageSeverity}</div>
          <div className="text-white/60 text-xs">Severity</div>
        </div>
        <div className="text-center p-2 bg-white/5 rounded-lg">
          <div className="text-lg font-bold text-white">{stats.averageDuration}s</div>
          <div className="text-white/60 text-xs">Avg per Distraction</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-white/10 rounded-lg p-1 mb-4">
        {[
          { id: 'overview', label: 'Overview', icon: Eye },
          { id: 'hourly', label: 'Hourly', icon: Clock },
          { id: 'daily', label: 'Daily', icon: Calendar },
          { id: 'types', label: 'Types', icon: AlertTriangle }
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            onClick={() => setActiveTab(id)}
            size="sm"
            variant={activeTab === id ? "default" : "ghost"}
            className={cn(
              "text-xs px-1 py-1 min-w-0 flex-shrink-0 flex-1",
              activeTab === id 
                ? "bg-blue-500 text-white" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate text-xs">{label}</span>
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Top Distraction Types */}
            <div>
              <h4 className="text-white/80 text-sm font-medium mb-3">Top Distraction Types</h4>
              <div className="space-y-2">
                {Object.entries(patterns.byType)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .slice(0, 5)
                  .map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getTypeIcon(type)}</span>
                        <div>
                          <div className="text-white font-medium capitalize">{type.replace('_', ' ')}</div>
                          <div className="text-white/60 text-sm">{data.count} times</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{Math.round(data.totalDuration / 60)}m</div>
                        <div className="text-white/60 text-sm">Severity: {data.averageSeverity}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Context & Source */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-white/80 text-sm font-medium mb-3">By Context</h4>
                <div className="space-y-2">
                  {Object.entries(patterns.byContext)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .slice(0, 3)
                    .map(([context, data]) => (
                      <div key={context} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <span className="text-white/80 text-sm capitalize">{context}</span>
                        <span className="text-white font-medium">{data.count}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="text-white/80 text-sm font-medium mb-3">By Source</h4>
                <div className="space-y-2">
                  {Object.entries(patterns.bySource)
                    .sort(([,a], [,b]) => b.count - a.count)
                    .slice(0, 3)
                    .map(([source, data]) => (
                      <div key={source} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <span className="text-white/80 text-sm capitalize">{source}</span>
                        <span className="text-white font-medium">{data.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hourly Patterns */}
        {activeTab === 'hourly' && (
          <div>
            <h4 className="text-white/80 text-sm font-medium mb-3">Distractions by Hour</h4>
            <div className="space-y-2">
              {patterns.hourly.map((pattern, hour) => (
                <div key={hour} className="flex items-center space-x-3">
                  <div className="w-12 text-white/60 text-sm">{hourNames[hour]}</div>
                  <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (pattern.count / Math.max(...patterns.hourly.map(p => p.count))) * 100)}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-white text-sm">
                    {pattern.count} ({Math.round(pattern.totalDuration / 60)}m)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Patterns */}
        {activeTab === 'daily' && (
          <div>
            <h4 className="text-white/80 text-sm font-medium mb-3">Distractions by Day</h4>
            <div className="space-y-2">
              {patterns.daily.map((pattern, day) => (
                <div key={day} className="flex items-center space-x-3">
                  <div className="w-12 text-white/60 text-sm">{dayNames[day]}</div>
                  <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (pattern.count / Math.max(...patterns.daily.map(p => p.count))) * 100)}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-white text-sm">
                    {pattern.count} ({Math.round(pattern.totalDuration / 60)}m)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Types Tab */}
        {activeTab === 'types' && (
          <div>
            <h4 className="text-white/80 text-sm font-medium mb-3">All Distraction Types</h4>
            <div className="space-y-3">
              {Object.entries(patterns.byType)
                .sort(([,a], [,b]) => b.count - a.count)
                .map(([type, data]) => (
                  <div key={type} className="p-3 lg:p-4 bg-white/5 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl lg:text-2xl">{getTypeIcon(type)}</span>
                        <div>
                          <div className="text-white font-medium capitalize text-sm lg:text-base">{type.replace('_', ' ')}</div>
                          <div className="text-white/60 text-xs lg:text-sm">{data.count} occurrences</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-white font-medium text-sm lg:text-base">{Math.round(data.totalDuration / 60)}m total</div>
                        <div className="text-white/60 text-xs lg:text-sm">Avg: {Math.round(data.totalDuration / data.count)}s</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs lg:text-sm">
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400" />
                        <span className="text-white/80">Severity: {data.averageSeverity}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default DistractionPatterns

