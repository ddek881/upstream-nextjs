'use client'

import { useState, useEffect } from 'react'

interface QRCodeDisplayProps {
  qrCodeDataUrl: string
  amount: number
  streamTitle: string
  timeLeft: number
  onRefresh?: () => void
}

export default function QRCodeDisplay({ 
  qrCodeDataUrl, 
  amount, 
  streamTitle, 
  timeLeft, 
  onRefresh 
}: QRCodeDisplayProps) {
  const [isLoading, setIsLoading] = useState(false)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleRefresh = () => {
    if (onRefresh) {
      setIsLoading(true)
      onRefresh()
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-3 border border-slate-600/30">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-lg font-bold text-white mb-1">Pembayaran QRIS</h2>
        <p className="text-slate-300 text-xs">
          Scan QR code di bawah untuk melakukan pembayaran
        </p>
      </div>

      {/* Stream Info */}
      <div className="bg-slate-700/30 rounded-lg p-2 mb-3 border border-slate-600/20">
        <h3 className="text-sm font-semibold text-white mb-1">{streamTitle}</h3>
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-xs">Total Pembayaran:</span>
          <span className="text-lg font-bold text-green-400">
            Rp {amount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="flex justify-center mb-3">
        <div className="relative">
          {/* QR Code */}
          <div className="bg-white rounded-lg p-2 shadow-2xl border border-slate-600/20">
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code Pembayaran"
              className="w-48 h-48 object-contain"
            />
          </div>
          
          {/* Timer Overlay */}
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-3">
        <h4 className="text-blue-400 font-semibold mb-1 flex items-center gap-1 text-xs">
          📱 Cara Pembayaran:
        </h4>
        <ol className="text-slate-300 text-xs space-y-0.5">
          <li>1. Buka aplikasi e-wallet atau mobile banking Anda</li>
          <li>2. Pilih menu "Scan QRIS" atau "Pay QRIS"</li>
          <li>3. Scan QR code di atas</li>
          <li>4. Periksa detail pembayaran dan konfirmasi</li>
          <li>5. Masukkan PIN atau password untuk menyelesaikan pembayaran</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-1.5 px-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-xs"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Memuat...
            </>
          ) : (
            <>
              🔄 Refresh QR
            </>
          )}
        </button>
        
        <button
          onClick={() => window.history.back()}
          className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-1.5 px-2 rounded-lg transition-all duration-200 text-xs"
        >
          ⬅️ Kembali
        </button>
      </div>

      {/* Status Info */}
      <div className="mt-3 text-center">
        <p className="text-slate-400 text-xs">
          ⏰ Pembayaran akan otomatis diperiksa setiap 3 detik
        </p>
        <p className="text-slate-400 text-xs mt-0.5">
          💡 Pastikan pembayaran selesai sebelum waktu habis
        </p>
      </div>
    </div>
  )
}
