import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Base skeleton component with shimmer effect
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card skeleton component
 */
export const CardSkeleton = ({ className }) => {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Task skeleton component
 */
export const TaskSkeleton = ({ className }) => {
  return (
    <div className={cn("glass-card p-4 space-y-3", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

/**
 * User profile skeleton
 */
export const UserProfileSkeleton = ({ className }) => {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Stats skeleton component
 */
export const StatsSkeleton = ({ className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {[...Array(4)].map((_, index) => (
        <div key={index} className="glass-card p-6 text-center space-y-3">
          <Skeleton className="h-12 w-12 rounded-lg mx-auto" />
          <Skeleton className="h-6 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  )
}

/**
 * Table skeleton component
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      {/* Table header */}
      <div className="border-b border-white/10 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, index) => (
            <Skeleton key={index} className="h-4 w-20" />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-white/5 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Chart skeleton component
 */
export const ChartSkeleton = ({ className }) => {
  return (
    <div className={cn("glass-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="h-64 space-y-2">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex items-end space-x-2">
            <Skeleton 
              className="w-8 rounded-t" 
              style={{ height: `${Math.random() * 200 + 50}px` }}
            />
            <Skeleton 
              className="w-8 rounded-t" 
              style={{ height: `${Math.random() * 200 + 50}px` }}
            />
            <Skeleton 
              className="w-8 rounded-t" 
              style={{ height: `${Math.random() * 200 + 50}px` }}
            />
            <Skeleton 
              className="w-8 rounded-t" 
              style={{ height: `${Math.random() * 200 + 50}px` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * List skeleton component
 */
export const ListSkeleton = ({ items = 5, className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      {[...Array(items)].map((_, index) => (
        <div key={index} className="glass-card p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Form skeleton component
 */
export const FormSkeleton = ({ fields = 4, className }) => {
  return (
    <div className={cn("glass-card p-6 space-y-6", className)}>
      {[...Array(fields)].map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Dashboard skeleton - combines multiple skeleton components
 */
export const DashboardSkeleton = ({ className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats */}
      <StatsSkeleton />
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartSkeleton />
          <TableSkeleton rows={4} columns={3} />
        </div>
        <div className="space-y-6">
          <ListSkeleton items={4} />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

export default Skeleton
