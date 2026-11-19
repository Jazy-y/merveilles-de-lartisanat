'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon, AlertCircle, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageEditor } from '@/components/ui/image-editor'

interface DragDropUploadProps {
  onFileSelect: (file: File) => void
  onRemove?: () => void
  onImageEdit?: (editedImageBlob: Blob) => void
  preview?: string | null
  loading?: boolean
  error?: string | null
  className?: string
  maxSize?: number // in MB
  acceptedTypes?: string[]
  enableEditing?: boolean
  aspectRatio?: number
  cropShape?: 'rect' | 'round'
}

export function DragDropUpload({
  onFileSelect,
  onRemove,
  onImageEdit,
  preview,
  loading = false,
  error = null,
  className,
  maxSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  enableEditing = true,
  aspectRatio = 1,
  cropShape = 'rect'
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingImageSrc, setEditingImageSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Type de fichier non pris en charge. Veuillez télécharger : ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `La taille du fichier doit être inférieure à ${maxSize}MB`
    }
    
    return null
  }, [acceptedTypes, maxSize])

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setDragError(validationError)
      return
    }
    
    setDragError(null)
    
    if (enableEditing) {
      // Open editor for cropping
      const imageUrl = URL.createObjectURL(file)
      setEditingImageSrc(imageUrl)
      setIsEditorOpen(true)
    } else {
      onFileSelect(file)
    }
  }, [validateFile, onFileSelect, enableEditing])

  const handleEditImage = useCallback(() => {
    if (preview) {
      setEditingImageSrc(preview)
      setIsEditorOpen(true)
    }
  }, [preview])

  const handleSaveEditedImage = useCallback((croppedImageBlob: Blob) => {
    // If we have onImageEdit callback, use it for existing images
    if (onImageEdit) {
      onImageEdit(croppedImageBlob)
    } else {
      // Otherwise, convert to file and use onFileSelect for new uploads
      const file = new File([croppedImageBlob], 'edited-image.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
      onFileSelect(file)
    }
    
    // Clean up the object URL after a short delay to ensure the new preview is set
    setTimeout(() => {
      if (editingImageSrc) {
        URL.revokeObjectURL(editingImageSrc)
      }
    }, 100)
    
    setIsEditorOpen(false)
    setEditingImageSrc(null)
  }, [onFileSelect, onImageEdit, editingImageSrc])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove()
    }
    setDragError(null)
  }, [onRemove])

  return (
    <div className={cn("w-full", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          error || dragError ? "border-red-500 bg-red-50" : "",
          loading ? "opacity-50 pointer-events-none" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Aperçu"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  if (process.env.NODE_ENV === 'development') console.error('Image failed to load:', preview, e)
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  // Show a fallback
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center hidden">
                <div className="text-center text-gray-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aperçu de l'image indisponible</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                {enableEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditImage()
                    }}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
                {onRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                ) : (
                  <Upload className="h-6 w-6 text-gray-600" />
                )}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {loading ? 'Téléchargement en cours...' : 'Télécharger une image'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Glissez-déposez une image ici, ou cliquez pour sélectionner
              </p>
              
              <div className="text-xs text-gray-500">
                <p>Formats pris en charge : {acceptedTypes.map(type => type.split('/')[1]).join(', ')}</p>
                <p>Taille max : {maxSize}MB</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {(error || dragError) && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error || dragError}
        </div>
      )}

      {/* Image Editor Modal */}
      {editingImageSrc && (
        <ImageEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            if (editingImageSrc) {
              URL.revokeObjectURL(editingImageSrc)
            }
            setEditingImageSrc(null)
          }}
          onSave={handleSaveEditedImage}
          imageSrc={editingImageSrc}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
          showGrid={true}
        />
      )}
    </div>
  )
}

