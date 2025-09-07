import { useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

/**
 * Custom hook for API calls with loading states and error handling
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (requestFn, options = {}) => {
    const { 
      showLoadingToast = false, 
      showSuccessToast = false, 
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      errorMessage = 'An error occurred'
    } = options

    setLoading(true)
    setError(null)

    if (showLoadingToast) {
      toast.loading('Processing...')
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('focusflow-token')
      // Axios default headers
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        delete axios.defaults.headers.common['Authorization']
      }
      const response = await requestFn()
      
      if (showSuccessToast) {
        toast.success(successMessage)
      }
      
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.message || errorMessage
      setError(message)
      
      if (showErrorToast) {
        toast.error(message)
      }
      
      return { success: false, error: message }
    } finally {
      setLoading(false)
      if (showLoadingToast) {
        toast.dismiss()
      }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    makeRequest,
    clearError
  }
}

/**
 * Hook for handling form submissions with API calls
 */
export const useFormSubmit = (submitFn, options = {}) => {
  const { makeRequest, loading, error } = useApi()

  const handleSubmit = useCallback(async (data) => {
    return await makeRequest(() => submitFn(data), options)
  }, [makeRequest, submitFn, options])

  return {
    handleSubmit,
    loading,
    error
  }
}
