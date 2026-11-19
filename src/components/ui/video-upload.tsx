'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoUploadProps {
  onFileSelect: (file: File) => void
  onRemove: () => void
  preview?: string | null
  loading?: boolean
  error?: string | null
  className?: string
  uploadProgress?: number
}

export function VideoUpload({
  onFileSelect,
  onRemove,
  preview,
  loading = false,
  error = null,
  className,
  uploadProgress = 0
}: VideoUploadProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
  }

  if (preview) {

    return (
      <div className={cn("relative border-2 border-dashed border-gray-300 rounded-lg p-4", className)}>
        <div className="relative">
          <video
            ref={videoRef}
            src={preview}
            className="w-full h-48 object-cover rounded-lg"
            onEnded={handleVideoEnded}
            muted={isMuted}
            preload="metadata"
            controls={false}
            onError={(e) => {
              if (process.env.NODE_ENV === 'development') console.error('Video load error:', e)
              if (process.env.NODE_ENV === 'development') console.error('Failed to load video from:', preview)
              setVideoError('Échec du chargement de la vidéo')
              setVideoLoading(false)
            }}
            onLoadStart={() => {

              setVideoLoading(true)
              setVideoError(null)
            }}
            onCanPlay={() => {

              setVideoLoading(false)
              setVideoError(null)
            }}
            onLoadedData={() => {

              setVideoLoading(false)
            }}
          />
          
          {/* Loading Overlay */}
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Chargement de la vidéo...</p>
              </div>
            </div>
          )}
          
          {/* Error Overlay */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-75 rounded-lg">
              <div className="text-white text-center">
                <p className="text-sm font-medium">Erreur Vidéo</p>
                <p className="text-xs mt-1">{videoError}</p>
              </div>
            </div>
          )}
          
          {/* Video Controls Overlay */}
          {!videoLoading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={togglePlayPause}
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={toggleMute}
                className="bg-white bg-opacity-90 hover:bg-opacity-100"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          )}
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-gray-600">Vidéo téléchargée avec succès</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Retirer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors",
        error && "border-red-300 bg-red-50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="space-y-4">
        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
        
        <div>
          <p className="text-lg font-medium text-gray-900">
            {loading ? 'Téléchargement de la vidéo...' : 'Télécharger une Vidéo'}
          </p>
          <p className="text-sm text-gray-600">
            Glissez-déposez un fichier vidéo ici, ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Prend en charge MP4, WebM, OGG, AVI, MOV, WMV (max 100MB)
          </p>
          
          {loading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Téléchargement...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
            {error}
          </p>
        )}
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="mx-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          {loading ? 'Téléchargement...' : 'Choisir un Fichier Vidéo'}
        </Button>
      </div>
    </div>
  )
}
