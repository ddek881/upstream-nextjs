'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

interface HLSPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  controls?: boolean
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
}

export function HLSPlayer({
  src,
  poster,
  autoPlay = false,
  controls = true,
  onTimeUpdate,
  onEnded
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, _setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Initialize HLS
    if (Hls.isSupported()) {
      hlsRef.current = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })

      hlsRef.current.loadSource(src)
      hlsRef.current.attachMedia(video)

      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(console.error)
        }
      })

      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data)
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src
      if (autoPlay) {
        video.play().catch(console.error)
      }
    }

    // Event listeners
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)

      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [src, autoPlay, onTimeUpdate, onEnded])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(console.error)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    const video = videoRef.current
    if (!video) return

    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    const video = videoRef.current
    if (!video) return

    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full"
        playsInline
        webkit-playsinline="true"
      />

      {/* Custom Controls */}
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-orange-500 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-orange-500 transition-colors"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-orange-500 transition-colors"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
