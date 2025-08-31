'use client'

import { Stream } from '@/lib/database'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { useUserID } from '@/components/UserIDProvider'

interface StreamCardProps {
  stream: Stream
}

export default function StreamCard({ stream }: StreamCardProps) {
  const [trialTimeLeft, setTrialTimeLeft] = useState<number | null>(null)
  const [isTrialActive, setIsTrialActive] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [hasPaidAccess, setHasPaidAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [hasUsedTrial, setHasUsedTrial] = useState(false)
  const [checkingTrial, setCheckingTrial] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  
  const { userId, isLoading: userIdLoading } = useUserID()

  // Check payment access and trial usage on mount
  useEffect(() => {
    if (stream.is_paid && stream.is_live && userId) {
      checkPaymentAccess()
      checkTrialUsage()
    }
  }, [stream.id, stream.is_paid, stream.is_live, userId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  const checkPaymentAccess = async () => {
    try {
      setCheckingAccess(true)
      const sessionId = localStorage.getItem('currentSessionId')
      
      if (sessionId) {
        const response = await fetch(`/api/check-access?sessionId=${sessionId}&streamId=${stream.id}`)
        if (response.ok) {
          const data = await response.json()
          setHasPaidAccess(data.data.hasAccess)
        }
      }
    } catch (error) {
      console.error('Error checking payment access:', error)
    } finally {
      setCheckingAccess(false)
    }
  }

  const checkTrialUsage = async () => {
    if (!userId) return
    
    try {
      setCheckingTrial(true)
      const response = await fetch(`/api/check-trial?userId=${userId}&streamId=${stream.id}`)
      if (response.ok) {
        const data = await response.json()
        setHasUsedTrial(data.data.hasUsedTrial)
      }
    } catch (error) {
      console.error('Error checking trial usage:', error)
    } finally {
      setCheckingTrial(false)
    }
  }

  // Refresh payment access (called after successful payment)
  const refreshPaymentAccess = () => {
    checkPaymentAccess()
  }

  // Listen for payment success event
  useEffect(() => {
    const handlePaymentSuccess = () => {
      refreshPaymentAccess()
    }

    window.addEventListener('payment-success', handlePaymentSuccess)
    return () => {
      window.removeEventListener('payment-success', handlePaymentSuccess)
    }
  }, [])

  // Start video when trial becomes active
  useEffect(() => {
    if (isTrialActive && !videoError) {
      // Small delay to ensure video element is rendered
      setTimeout(() => {
        startVideo()
      }, 100)
    }
  }, [isTrialActive, videoError])

  const startVideo = () => {
    if (!videoRef.current) return
    
    setVideoError(false)
    setVideoLoading(true)
    setVideoReady(false)
    setShowErrorPopup(false)
    
    const video = videoRef.current
    
    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    
    if (Hls.isSupported()) {
      try {
        // Create new HLS instance
        hlsRef.current = new Hls({ 
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        })
        
        // Attach media first
        hlsRef.current.attachMedia(video)
        
        // Load source
        hlsRef.current.loadSource(stream.url)
        
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().then(() => {
            // Video play successful
          }).catch(error => {
            handleVideoError()
          })
        })
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          handleVideoError()
        })
        
      } catch (error) {
        handleVideoError()
      }
      
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = stream.url
      video.play().then(() => {
        // Native HLS video play successful
      }).catch(error => {
        handleVideoError()
      })
    } else {
      handleVideoError()
    }
  }

  const startTrial = async () => {
    if (!userId || hasUsedTrial) return
    
    try {
      // Record trial usage first
      const response = await fetch('/api/check-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          streamId: stream.id
        })
      })

      if (response.ok) {
        // Start trial
        setIsTrialActive(true)
        setHasUsedTrial(true)
        startCountdown()
      } else {
        const errorData = await response.json()
        console.error('Error starting trial:', errorData.error)
        alert(errorData.error || 'Gagal memulai trial')
      }
    } catch (error) {
      console.error('Error starting trial:', error)
      alert('Gagal memulai trial')
    }
  }

  const startCountdown = () => {
    setTrialTimeLeft(7)
    
    countdownRef.current = setInterval(() => {
      setTrialTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          // Stop countdown
          if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
          }
          // Reset states
          setIsTrialActive(false)
          setVideoError(false)
          setVideoLoading(false)
          setVideoReady(false)
          setVideoPlaying(false)
          setShowErrorPopup(false)
          // Redirect
          window.location.href = `/payment?streamId=${stream.id}`
          return 0
        }
        return prev !== null ? prev - 1 : null
      })
    }, 1000)
  }

  const handleVideoError = () => {
    setVideoError(true)
    setVideoLoading(false)
    setVideoReady(false)
    setVideoPlaying(false)
    setShowErrorPopup(true)
    
    // Auto hide error popup after 5 seconds
    setTimeout(() => {
      setShowErrorPopup(false)
      setIsTrialActive(false)
    }, 5000)
  }

  const startFreeTrial = () => {
    setIsTrialActive(true)
    setVideoError(false)
    setVideoLoading(true)
    setVideoReady(false)
    setVideoPlaying(false)
    setShowErrorPopup(false)
    
    // HLS.js akan di-setup setelah video element di-render
    setTimeout(() => {
      if (videoRef.current) {
        const video = videoRef.current
        
        // Clean up previous HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
        }
        
        if (Hls.isSupported()) {
          try {
            // Create new HLS instance
            hlsRef.current = new Hls({ debug: false })
            
            // Attach media first
            hlsRef.current.attachMedia(video)
            
            // Load source
            hlsRef.current.loadSource(stream.url)
            
            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              video.play().then(() => {
                // Video play successful
              }).catch(error => {
                handleVideoError()
              })
            })
            
            hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
              handleVideoError()
            })
            
          } catch (error) {
            handleVideoError()
          }
          
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = stream.url
          video.play().then(() => {
            // Native HLS video play successful
          }).catch(error => {
            handleVideoError()
          })
        } else {
          handleVideoError()
        }
      } else {
        handleVideoError()
      }
    }, 100)
  }

  const formatTime = (seconds: number) => {
    return `${seconds}s`
  }

  return (
    <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl overflow-hidden hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-500 border border-gray-600/30 hover:border-gray-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50">
      <div className="relative">
        {isTrialActive && !videoError ? (
          // Tampilkan video player saat trial aktif dan tidak ada error
          <div className="relative w-full h-52 bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted={false}
              playsInline
              onLoadStart={() => {
                setVideoLoading(true)
              }}
              onLoadedData={() => {
                setVideoLoading(false)
              }}
              onCanPlay={() => {
                setVideoReady(true)
                setVideoLoading(false)
              }}
              onPlaying={() => {
                setVideoReady(true)
                setVideoLoading(false)
                setVideoPlaying(true)
                // Start countdown only after video starts playing
                if (!countdownRef.current) {
                  startCountdown()
                }
              }}
              onError={(e) => {
                handleVideoError()
              }}
            />
            
            {/* Loading indicator saat video sedang load */}
            {videoLoading && !videoReady && !videoError && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="relative mb-3">
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                  <p className="text-xs font-medium">Memuat video...</p>
                </div>
              </div>
            )}
            
            {/* Timer overlay di atas video - hanya muncul jika video playing */}
            {trialTimeLeft !== null && trialTimeLeft > 0 && videoPlaying && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold z-10 border border-white/20">
                {formatTime(trialTimeLeft)}
              </div>
            )}
            
            {/* Trial info overlay */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs z-10 border border-white/20">
              {videoLoading ? 'Memuat...' : videoPlaying ? 'Free Trial' : 'Memulai video...'}
            </div>
          </div>
        ) : (
          // Tampilkan thumbnail saat tidak trial atau ada error
          <div className="relative w-full h-52 overflow-hidden">
            <img
              src={stream.thumbnail}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Error popup overlay */}
            {showErrorPopup && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white p-4 max-w-xs">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="text-lg font-bold mb-2">Live Streaming Tidak Tersedia</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Maaf, live streaming sedang mengalami gangguan atau tidak tersedia saat ini.
                  </p>
                  <button
                    onClick={() => setShowErrorPopup(false)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Live badge */}
        {stream.is_live && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-red-400/30">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}
        
        {/* Price badge */}
        {stream.is_live && stream.is_paid && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-yellow-400/30">
            {hasPaidAccess ? '👑 Premium' : `💰 Rp ${stream.price?.toLocaleString()}`}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
          {stream.title}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
          {stream.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {stream.is_live && (
              <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                Sedang Live
              </span>
            )}
            {!stream.is_live && stream.scheduled_time && (
              <span className="text-xs text-gray-400">
                {new Date(stream.scheduled_time).toLocaleString('id-ID')}
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          {checkingAccess || checkingTrial ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-xs text-gray-400">Cek Akses...</span>
            </div>
          ) : stream.is_live ? (
            stream.is_paid ? (
              hasPaidAccess ? (
                <Link
                  href={`/stream?id=${stream.id}`}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 flex items-center gap-2"
                >
                  <span className="text-sm">👑</span>
                  Tonton
                </Link>
              ) : (
                <div className="flex gap-2">
                  {hasUsedTrial ? (
                    <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-gray-700/50">
                      Trial Terpakai
                    </span>
                  ) : (
                    <button
                      onClick={startTrial}
                      disabled={isTrialActive || userIdLoading}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                    >
                      {isTrialActive ? 'Trial Aktif' : 'Uji Coba 7s'}
                    </button>
                  )}
                  <Link
                    href={`/payment?streamId=${stream.id}`}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    Bayar
                  </Link>
                </div>
              )
            ) : (
              <Link
                href={`/stream?id=${stream.id}`}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Tonton
              </Link>
            )
          ) : (
            <span className="text-xs text-gray-400 bg-gray-800/50 px-2.5 py-1.5 rounded-xl backdrop-blur-sm border border-gray-700/50">
              Segera Hadir
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

