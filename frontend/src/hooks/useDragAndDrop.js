import { useState, useRef, useCallback } from 'react'

/**
 * Custom hook for drag and drop functionality
 */
const useDragAndDrop = (items, onReorder) => {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const dragRef = useRef(null)

  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    
    // Add visual feedback
    if (e.target) {
      e.target.style.opacity = '0.5'
    }
  }, [])

  const handleDragEnd = useCallback((e) => {
    // Reset visual feedback
    if (e.target) {
      e.target.style.opacity = '1'
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback((e) => {
    // Only clear dragOverIndex if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null)
    }
  }, [])

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, onReorder])

  const getDragProps = useCallback((index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, index),
    onDragEnd: handleDragEnd,
    onDragOver: (e) => handleDragOver(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index),
    style: {
      cursor: 'move',
      transform: draggedIndex === index ? 'rotate(5deg)' : 'none',
      transition: 'transform 0.2s ease',
      opacity: draggedIndex === index ? 0.5 : 1,
      border: dragOverIndex === index ? '2px dashed #3B82F6' : 'none',
      backgroundColor: dragOverIndex === index ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
    }
  }), [draggedIndex, dragOverIndex, handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop])

  return {
    draggedIndex,
    dragOverIndex,
    getDragProps
  }
}

export default useDragAndDrop

