'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Stream } from '@/lib/database'
import { ArrowLeft, Users, Clock, DollarSign, Crown, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useUserID } from '@/components/UserIDProvider'
import Hls from 'hls.js'

function StreamPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const streamId = searchParams.get('id')
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [hasPaidAccess, setHasPaidAccess] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [showPaymentPopup, setShowPaymentPopup] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  
  const { userId, isLoading: userIdLoading } = useUserID()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    if (streamId) {
      const fetchStream = async () => {
        try {
          setLoading(true)
          
          // Use API instead of direct database call
          const response = await fetch(`/api/streams/${streamId}`)
          if (response.ok) {
            const foundStream = await response.json()
            setStream(foundStream)
            
            // Simulate viewer count
            setViewerCount(Math.floor(Math.random() * 1000) + 100)

            // Check payment access if stream is paid and userId is available
            if (foundStream?.is_paid && userId) {
              await checkPaymentAccess(foundStream.id)
            }
          } else {
            console.error('Stream not found:', response.status)
            setStream(null)
          }
        } catch (error) {
          console.error('Error fetching stream:', error)
          setStream(null)
        } finally {
          setLoading(false)
        }
      }
      fetchStream()
    }
  }, [streamId, userId])

  const checkPaymentAccess = async (streamId: string) => {
    if (!userId) return
    
    try {
      setCheckingAccess(true)
      
      const response = await fetch(`/api/check-access?userId=${userId}&streamId=${streamId}`)
      if (response.ok) {
        const data = await response.json()
        setHasPaidAccess(data.data.hasAccess)
        
        // If user doesn't have access, show popup
        if (!data.data.hasAccess) {
          setShowPaymentPopup(true)
        }
      } else {
        // If API fails, assume no access
        setHasPaidAccess(false)
        setShowPaymentPopup(true)
      }
    } catch (error) {
      console.error('Error checking payment access:', error)
      setHasPaidAccess(false)
      setShowPaymentPopup(true)
    } finally {
      setCheckingAccess(false)
    }
  }

  const handleVideoError = () => {
    setVideoError(true)
    setVideoLoading(false)
    setVideoReady(false)
    setShowErrorPopup(true)
    
    // Auto hide error popup after 8 seconds
    setTimeout(() => {
      setShowErrorPopup(false)
    }, 8000)
  }

  const startVideo = () => {
    if (!videoRef.current || !stream) return
    
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

  const handlePaymentRedirect = () => {
    if (stream) {
      router.push(`/payment?streamId=${stream.id}`)
    }
  }

  const handleHomeRedirect = () => {
    router.push('/')
  }

  // Start video when stream is loaded and user has access
  useEffect(() => {
    if (stream && (!stream.is_paid || (stream.is_paid && hasPaidAccess))) {
      // Small delay to ensure video element is rendered
      setTimeout(() => {
        startVideo()
      }, 100)
    }
  }, [stream, hasPaidAccess])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  // Show loading while userId is being initialized
  if (userIdLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Menyiapkan stream...</p>
          {userId && (
            <p className="text-xs text-gray-500 mt-2">User ID: {userId}</p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat stream...</p>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📺</div>
          <h1 className="text-2xl font-bold text-white mb-2">Stream tidak ditemukan</h1>
          <p className="text-slate-400 mb-6">Stream yang Anda cari tidak tersedia</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Payment Access Popup */}
      {showPaymentPopup && stream.is_paid && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Akses Dibatasi</h2>
              <p className="text-slate-300 text-sm">
                Anda belum melakukan pembayaran untuk stream ini
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handlePaymentRedirect}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Bayar Sekarang
              </button>
              <button
                onClick={handleHomeRedirect}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden">
              {stream.is_paid && !hasPaidAccess ? (
                <div className="aspect-video bg-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Stream Premium</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Anda perlu membayar untuk menonton stream ini
                    </p>
                    <button
                      onClick={handlePaymentRedirect}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              ) : videoError ? (
                // Show thumbnail when video error
                <div className="relative aspect-video">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Error popup overlay */}
                  {showErrorPopup && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-white p-6 max-w-md">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h3 className="text-xl font-bold mb-3">Live Streaming Tidak Tersedia</h3>
                        <p className="text-sm text-gray-300 mb-6">
                          Maaf, live streaming sedang mengalami gangguan atau tidak tersedia saat ini.
                        </p>
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              setShowErrorPopup(false)
                              setVideoError(false)
                              startVideo()
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Coba Lagi
                          </button>
                          <button
                            onClick={() => setShowErrorPopup(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Tutup
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Show video player
                <div className="relative aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay={stream.is_live}
                    muted={false}
                    controls
                    playsInline
                    poster={stream.thumbnail}
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
                    onError={(e) => {
                      handleVideoError()
                    }}
                  />
                  
                  {/* Loading indicator saat video sedang load */}
                  {videoLoading && !videoReady && !videoError && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="relative mb-3">
                          <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                        <p className="text-sm font-medium">Memuat video...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="mt-6 bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {stream.title}
                  </h1>
                  <p className="text-slate-300">
                    {stream.description}
                  </p>
                </div>
                
                {/* Live Badge */}
                {stream.is_live && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                )}
              </div>

              {/* Stream Stats */}
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{viewerCount} menonton</span>
                </div>
                
                {stream.scheduled_time && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatTime(stream.scheduled_time)}</span>
                  </div>
                )}
                
                {stream.estimated_duration && (
                  <span>{stream.estimated_duration}</span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Info */}
            {stream.is_paid && (
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  {hasPaidAccess ? <Crown className="w-5 h-5 text-yellow-400" /> : <DollarSign size={20} />}
                  {hasPaidAccess ? 'Stream Premium' : 'Stream Premium'}
                </h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {hasPaidAccess ? '👑 Akses Aktif' : formatPrice(stream.price || 0)}
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  {hasPaidAccess 
                    ? 'Anda memiliki akses premium untuk stream ini'
                    : 'Akses eksklusif ke konten premium dengan kualitas terbaik'
                  }
                </p>
                {!hasPaidAccess && (
                  <button 
                    onClick={handlePaymentRedirect}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Bayar Sekarang
                  </button>
                )}
              </div>
            )}

            {/* Stream Details */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Detail Stream
              </h3>
              
              <div className="space-y-3 text-sm">
                {stream.scheduled_time && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jadwal:</span>
                    <span className="text-white">{formatTime(stream.scheduled_time)}</span>
                  </div>
                )}
                
                {stream.estimated_duration && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Durasi:</span>
                    <span className="text-white">{stream.estimated_duration}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-medium ${
                    stream.is_live ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {stream.is_live ? 'Live' : 'Akan Datang'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400">Akses:</span>
                  <span className={`font-medium ${
                    stream.is_paid ? 'text-purple-400' : 'text-green-400'
                  }`}>
                    {stream.is_paid ? 'Premium' : 'Gratis'}
                  </span>
                </div>

                {stream.is_paid && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status Pembayaran:</span>
                    <span className={`font-medium ${
                      hasPaidAccess ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {hasPaidAccess ? 'Sudah Bayar' : 'Belum Bayar'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Streams */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Stream Terkait
              </h3>
              <p className="text-slate-400 text-sm">
                Fitur ini akan menampilkan stream lain yang mungkin Anda sukai
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StreamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat...</p>
        </div>
      </div>
    }>
      <StreamPageContent />
    </Suspense>
  )
}
