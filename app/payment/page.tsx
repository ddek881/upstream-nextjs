'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Stream } from '@/lib/database'
import Link from 'next/link'
import { useUserID } from '@/components/UserIDProvider'
import QRCodeDisplay from '@/components/QRCodeDisplay'

function PaymentPageContent() {
  const searchParams = useSearchParams()
  const streamId = searchParams.get('streamId')
  
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending')
  const [timeLeft, setTimeLeft] = useState(300) // 5 menit
  const [alreadyHasAccess, setAlreadyHasAccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const { userId, isLoading: userIdLoading } = useUserID()

  useEffect(() => {
    if (streamId) {
      fetchStream()
      startPaymentTimer()
    }
  }, [streamId])

  useEffect(() => {
    // Generate QRIS setelah stream data ter-load dan userId tersedia
    if (stream && stream.price && !alreadyHasAccess && userId) {
      generateQRIS()
    }
  }, [stream, alreadyHasAccess, userId])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timeLeft > 0 && paymentStatus === 'pending' && !alreadyHasAccess) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPaymentStatus('expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timeLeft, paymentStatus, alreadyHasAccess])

  const fetchStream = async () => {
    try {
      const response = await fetch(`/api/streams/${streamId}`)
      if (response.ok) {
        const data = await response.json()
        setStream(data)
      } else {
        console.error('Failed to fetch stream:', response.status)
        // Handle 404 or other errors
        if (response.status === 404) {
          // Stream not found - this will be handled by the UI
        }
      }
    } catch (error) {
      console.error('Error fetching stream:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRIS = async () => {
    try {
      const requestBody = {
        streamId: streamId,
        amount: stream?.price || 0,
        userId: userId
      }
      
      const response = await fetch('/api/generate-qris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const data = await response.json()
        setQrCode(data.data.qrCode)
        // Store trxId for payment status checking
        localStorage.setItem('currentTrxId', data.data.trxId)
        setErrorMessage('')
      } else {
        const errorData = await response.json()
        console.error('Failed to generate QRIS:', errorData)
        
        // Check if user already has access
        if (errorData.error === 'Anda sudah memiliki akses untuk stream ini') {
          setAlreadyHasAccess(true)
          setErrorMessage('')
        } else {
          setErrorMessage(errorData.error || 'Gagal generate QRIS')
        }
      }
    } catch (error) {
      console.error('Error generating QRIS:', error)
      setErrorMessage('Error generating QRIS')
    }
  }

  const startPaymentTimer = () => {
    // Simulasi timer pembayaran
    setTimeout(() => {
      // Check payment status setiap 10 detik
      checkPaymentStatus()
    }, 1000)
  }

  const checkPaymentStatus = async () => {
    try {
      const trxId = localStorage.getItem('currentTrxId')
      
      if (!trxId || !userId) return

      const response = await fetch(`/api/payment-callback?trxId=${trxId}&userId=${userId}&streamId=${streamId}`)
      if (response.ok) {
        const data = await response.json()
        
        if (data.data.status === 'paid') {
          setPaymentStatus('paid')
          // Check access after payment
          checkAccess()
          // Emit payment success event
          window.dispatchEvent(new CustomEvent('payment-success'))
          // Redirect to stream page after 2 seconds
          setTimeout(() => {
            window.location.href = `/stream?id=${streamId}`
          }, 2000)
        } else if (data.data.status === 'expired' || timeLeft <= 0) {
          setPaymentStatus('expired')
        } else {
          // Check lagi dalam 10 detik
          setTimeout(checkPaymentStatus, 10000)
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      // Fallback: check lagi dalam 10 detik
      if (timeLeft > 0) {
        setTimeout(checkPaymentStatus, 10000)
      }
    }
  }

  const checkAccess = async () => {
    try {
      if (!userId || !streamId) return

      const response = await fetch(`/api/check-access?userId=${userId}&streamId=${streamId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Access check result:', data.data)
        
        if (data.data.hasAccess) {
          console.log('User has paid access to stream')
        } else {
          console.log('User does not have paid access')
        }
      }
    } catch (error) {
      console.error('Error checking access:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Show loading while userId is being initialized
  if (userIdLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Menyiapkan pembayaran...</p>
          {userId && (
            <p className="text-xs text-gray-500 mt-2">User ID: {userId}</p>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payment page...</p>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stream tidak ditemukan</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  // Jika user sudah memiliki akses
  if (alreadyHasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700">
          <div className="mb-6">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-2xl font-bold mb-2">Anda Sudah Memiliki Akses!</h1>
            <p className="text-gray-400 mb-6">
              Anda sudah membayar untuk stream ini dan memiliki akses premium.
            </p>
          </div>

          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-green-400 mb-2">{stream.title}</h2>
            <p className="text-sm text-gray-300">{stream.description}</p>
          </div>

          <div className="space-y-4">
            <Link
              href={`/stream?id=${streamId}`}
              className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              🎬 Tonton Stream Sekarang
            </Link>
            
            <Link
              href="/"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Status: <span className="text-green-400">Akses Aktif</span></p>
            <p>Stream ID: {streamId}</p>
            <p>User ID: {userId}</p>
          </div>
        </div>
      </div>
    )
  }

  // Jika ada error
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700">
          <div className="mb-6">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Error</h1>
            <p className="text-red-400 mb-6">{errorMessage}</p>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-4xl mx-auto p-3">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1">💳 Pembayaran QRIS</h1>
          <p className="text-gray-400 text-xs">Scan QR code untuk melakukan pembayaran</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* QR Code Section */}
          <div>
            {paymentStatus === 'paid' ? (
              <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-xl rounded-3xl p-8 border border-green-600/30 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2 text-green-400">Pembayaran Berhasil!</h3>
                <p className="text-slate-300 mb-6">
                  Anda akan diarahkan ke halaman stream dalam beberapa detik...
                </p>
                <Link
                  href={`/stream?id=${streamId}`}
                  className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  🎬 Tonton Stream Sekarang
                </Link>
              </div>
            ) : paymentStatus === 'expired' ? (
              <div className="bg-gradient-to-br from-red-800/50 to-red-900/50 backdrop-blur-xl rounded-3xl p-8 border border-red-600/30 text-center">
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold mb-2 text-red-400">Waktu Habis</h3>
                <p className="text-slate-300 mb-6">
                  Waktu pembayaran telah habis. Silakan coba lagi.
                </p>
                <button
                  onClick={() => {
                    setPaymentStatus('pending')
                    setTimeLeft(300)
                    generateQRIS()
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  🔄 Coba Lagi
                </button>
              </div>
            ) : (
              <QRCodeDisplay
                qrCodeDataUrl={qrCode}
                amount={stream.price || 0}
                streamTitle={stream.title}
                timeLeft={timeLeft}
                onRefresh={generateQRIS}
              />
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-3 border border-gray-700">
            <h2 className="text-base font-semibold mb-3">Informasi Pembayaran</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-300 mb-1 text-xs">Detail Stream</h3>
                <div className="bg-gray-700/50 rounded-lg p-2">
                  <p className="font-semibold text-white mb-1 text-xs">{stream.title}</p>
                  <p className="text-xs text-gray-400 mb-1">{stream.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Harga:</span>
                    <span className="font-semibold text-green-400 text-xs">{formatPrice(stream.price)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-300 mb-1 text-xs">Instruksi Pembayaran</h3>
                <div className="bg-gray-700/50 rounded-lg p-2 space-y-0.5 text-xs">
                  <p>1. Buka aplikasi e-wallet atau mobile banking</p>
                  <p>2. Pilih fitur &quot;Scan QR&quot; atau &quot;Pay QRIS&quot;</p>
                  <p>3. Scan QR code di sebelah kiri</p>
                  <p>4. Masukkan PIN atau konfirmasi pembayaran</p>
                  <p>5. Tunggu konfirmasi pembayaran berhasil</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-300 mb-1 text-xs">Setelah Pembayaran</h3>
                <div className="bg-gray-700/50 rounded-lg p-2 space-y-0.5 text-xs">
                  <p>✅ Akses stream akan otomatis aktif</p>
                  <p>✅ Anda akan diarahkan ke halaman stream</p>
                  <p>✅ Akses berlaku selama 2 jam</p>
                  <p>✅ Satu pembayaran untuk satu stream</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-600">
                <Link
                  href="/"
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded-lg transition-colors text-center text-xs"
                >
                  ← Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payment page...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}
