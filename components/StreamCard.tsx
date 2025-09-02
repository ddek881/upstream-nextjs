'use client'

import { Stream, Category } from '@/lib/database'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import Hls from 'hls.js'
import { useUserID } from '@/components/UserIDProvider'

import { truncateHtml } from '@/utils/textUtils'

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
  const [hasPaidAccess, setHasPaidAccess] = useState<boolean | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [hasUsedTrial, setHasUsedTrial] = useState(false)
  const [checkingTrial, setCheckingTrial] = useState(false)
  const [scheduledCountdown, setScheduledCountdown] = useState<string>('')
  const [categoryData, setCategoryData] = useState<Category | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const scheduledCountdownRef = useRef<NodeJS.Timeout | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  
  const { userId, isLoading: userIdLoading } = useUserID()



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      if (scheduledCountdownRef.current) {
        clearInterval(scheduledCountdownRef.current)
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  const checkPaymentAccess = useCallback(async () => {
    try {
      setCheckingAccess(true)
      
      if (userId) {
        const response = await fetch(`/api/check-access?userId=${userId}&streamId=${stream.id}`)
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
  }, [userId, stream.id])

  const checkTrialUsage = useCallback(async () => {
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
  }, [userId, stream.id])

  // Fetch category data
  const fetchCategoryData = useCallback(async () => {
    if (!stream.category) return
    
    try {
      const response = await fetch(`/api/categories/${stream.category}`)
      if (response.ok) {
        const category = await response.json()
        setCategoryData(category)
      }
    } catch (error) {
      console.error('Error fetching category data:', error)
    }
  }, [stream.category])

  // Check payment access and trial usage on mount
  useEffect(() => {
    if (Boolean(stream.is_paid) && Boolean(stream.is_live) && userId) {
      checkPaymentAccess()
      checkTrialUsage()
    }
  }, [stream.id, stream.is_paid, stream.is_live, userId, checkPaymentAccess, checkTrialUsage])

  // Fetch category data on mount
  useEffect(() => {
    fetchCategoryData()
  }, [fetchCategoryData])

  // Function to format scheduled countdown with detailed Indonesian time
  const formatScheduledCountdown = (scheduledTime: string): string => {
    // Get current time in Indonesian timezone (WIB - UTC+7)
    const now = new Date()
    const nowInWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000)) // Add 7 hours for WIB
    
    // Parse scheduled time and assume it's in WIB
    const scheduledDate = new Date(scheduledTime)
    const scheduledInWIB = new Date(scheduledDate.getTime())
    
    const diff = scheduledInWIB.getTime() - nowInWIB.getTime()
    
    if (diff <= 0) {
      return 'Sedang Live'
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    // Format waktu Indonesia yang lebih detail
    if (days > 0) {
      if (hours > 0) {
        return `${days} hari ${hours} jam lagi`
      } else {
        return `${days} hari lagi`
      }
    } else if (hours > 0) {
      if (minutes > 0) {
        return `${hours} jam ${minutes} menit lagi`
      } else {
        return `${hours} jam lagi`
      }
    } else if (minutes > 0) {
      if (seconds > 30) {
        return `${minutes} menit ${seconds} detik lagi`
      } else {
        return `${minutes} menit lagi`
      }
    } else if (seconds > 0) {
      return `${seconds} detik lagi`
    } else {
      return 'Segera hadir'
    }
  }

  // Start scheduled countdown
  const startScheduledCountdown = useCallback(() => {
    if (!stream.scheduled_time || Boolean(stream.is_live)) return
    
    const updateCountdown = () => {
      const countdown = formatScheduledCountdown(stream.scheduled_time!)
      setScheduledCountdown(countdown)
      
      // If countdown reaches 0, clear interval
      const now = new Date()
      const nowInWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000)) // Add 7 hours for WIB
      const scheduledDate = new Date(stream.scheduled_time!)
      const scheduledInWIB = new Date(scheduledDate.getTime())
      if (scheduledInWIB.getTime() <= nowInWIB.getTime()) {
        if (scheduledCountdownRef.current) {
          clearInterval(scheduledCountdownRef.current)
          scheduledCountdownRef.current = null
        }
      }
    }
    
    // Initial update
    updateCountdown()
    
    // Update every second for more accurate countdown
    scheduledCountdownRef.current = setInterval(updateCountdown, 1000)
  }, [stream.scheduled_time, stream.is_live])

  // Start scheduled countdown on mount
  useEffect(() => {
    startScheduledCountdown()
    
    return () => {
      if (scheduledCountdownRef.current) {
        clearInterval(scheduledCountdownRef.current)
        scheduledCountdownRef.current = null
      }
    }
  }, [startScheduledCountdown])

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

  // Ensure clean boolean values - no numeric rendering
  const hasValidPrice = Boolean(stream.price && stream.price > 0)
  const isPaidStream = Boolean(stream.is_paid)
  const shouldShowPriceInfo = isPaidStream && hasValidPrice

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden hover:from-slate-700/60 hover:to-slate-800/60 transition-all duration-300 border border-slate-600/20 hover:border-slate-500/40 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-900/50">
      <div className="relative">
        {isTrialActive && !videoError ? (
          // Video player saat trial aktif
          <div className="relative w-full h-48 bg-black rounded-t-2xl">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-t-2xl"
              autoPlay
              muted={false}
              playsInline
              onLoadStart={() => setVideoLoading(true)}
              onLoadedData={() => setVideoLoading(false)}
              onCanPlay={() => {
                setVideoReady(true)
                setVideoLoading(false)
              }}
              onPlaying={() => {
                setVideoReady(true)
                setVideoLoading(false)
                setVideoPlaying(true)
                if (!countdownRef.current) {
                  startCountdown()
                }
              }}
              onError={() => handleVideoError()}
            />
            
            {/* Loading overlay */}
            {videoLoading && !videoReady && !videoError && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-t-2xl">
                <div className="text-center text-white">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-medium">Memuat...</p>
                </div>
              </div>
            )}
            
            {/* Trial timer */}
            {trialTimeLeft !== null && trialTimeLeft > 0 && videoPlaying && (
              <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                {formatTime(trialTimeLeft)}
              </div>
            )}
            
            {/* Trial badge */}
            <div className="absolute bottom-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium z-10">
              {videoLoading ? 'Memuat...' : videoPlaying ? 'Free Trial' : 'Memulai...'}
            </div>
          </div>
        ) : (
          // Thumbnail section
          <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
            <img
              src={stream.thumbnail}
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            

            
            {/* Error popup */}
            {showErrorPopup && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center rounded-t-2xl">
                <div className="text-center text-white p-4 max-w-xs">
                  <div className="text-3xl mb-2">⚠️</div>
                  <h3 className="text-base font-bold mb-2">Stream Tidak Tersedia</h3>
                  <p className="text-xs text-gray-300 mb-3">
                    Live streaming sedang mengalami gangguan.
                  </p>
                  <button
                    onClick={() => setShowErrorPopup(false)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Live badge */}
        {Boolean(stream.is_live) && (
          <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">LIVE</span>
            </div>
          </div>
        )}
        
        {/* Popular badge */}
        {Boolean(stream.is_popular) && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
            <div className="flex items-center gap-1">
              <span className="text-xs">🔥</span>
              <span className="font-semibold">HOT</span>
            </div>
          </div>
        )}
        
        {/* Price badge - only show for paid streams with valid price */}
        {Boolean(stream.is_live) && shouldShowPriceInfo && (
          <div className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
            {hasPaidAccess ? (
              <div className="flex items-center gap-1">
                <span className="text-xs">👑</span>
                <span className="font-semibold">Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs">💰</span>
                <span className="font-semibold">Rp {stream.price!.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
              {stream.title}
            </h3>
          </div>
          {/* Category logo */}
          {categoryData?.img_url && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-600/50 shadow-sm">
                <img
                  src={categoryData.img_url}
                  alt={categoryData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
        <p className="text-slate-300 text-sm mb-3 line-clamp-2 leading-relaxed">
          {truncateHtml(stream.description, 30)}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!Boolean(stream.is_live) && Boolean(stream.scheduled_time) && Boolean(scheduledCountdown) && scheduledCountdown !== '00' && scheduledCountdown !== '0' && (
              <div className="flex flex-col bg-blue-500/10 px-2 py-1.5 rounded-lg border border-blue-500/20">
                <span className="text-xs text-slate-300 font-medium">
                  {new Date(stream.scheduled_time!).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Jakarta'
                  })}
                </span>
                <span className="text-xs text-blue-400 font-bold">
                  {scheduledCountdown}
                </span>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          {checkingAccess || checkingTrial ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
              <span className="text-xs text-slate-400">Cek Akses...</span>
            </div>
          ) : Boolean(stream.is_live) ? (
            Boolean(stream.is_paid) ? (
              hasPaidAccess ? (
                <Link
                  href={`/stream?id=${stream.id}`}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-yellow-500/20 hover:scale-105 flex items-center gap-1"
                >
                  <span className="text-xs">👑</span>
                  <span className="font-bold">Tonton</span>
                </Link>
              ) : (
                <div className="flex gap-2">
                  {hasUsedTrial ? (
                    <span className="text-xs text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-slate-700/50 font-medium">
                      Trial Terpakai
                    </span>
                  ) : (
                    <button
                      onClick={startTrial}
                      disabled={isTrialActive || userIdLoading}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/20 hover:scale-105"
                    >
                      {isTrialActive ? 'Trial Aktif' : 'Uji Coba 7s'}
                    </button>
                  )}
                  <Link
                    href={`/payment?streamId=${stream.id}`}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-green-500/20 hover:scale-105"
                  >
                    Bayar
                  </Link>
                </div>
              )
            ) : (
              <Link
                href={`/stream?id=${stream.id}`}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/20 hover:scale-105"
              >
                Tonton
              </Link>
            )
          ) : (
            <Link
              href={`/stream?id=${stream.id}`}
              className="text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 font-medium transition-all duration-200 inline-block"
            >
              Lihat Detail
            </Link>
          )}
        </div>
      </div>

    </div>
  )
}

