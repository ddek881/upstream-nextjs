'use client'

import { useEffect } from 'react'

interface PaymentWarningPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function PaymentWarningPopup({ isOpen, onClose }: PaymentWarningPopupProps) {
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 PaymentWarningPopup: isOpen = true')
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden'
    } else {
      console.log('🔄 PaymentWarningPopup: isOpen = false')
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) {
    console.log('🔄 PaymentWarningPopup: not rendering (isOpen = false)')
    return null
  }

  console.log('🔄 PaymentWarningPopup: rendering popup')

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-orange-500/30 shadow-2xl">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-blue-700 mb-3">Peringatan Penting</h2>
          <p className="text-blue-700 mb-6 leading-relaxed">
            Pembayaran ini hanya bisa digunakan di <strong className="text-red-600">1 browser saja</strong>. 
            Pastikan Anda Menyaksikan Live Streaming di browser ini. <br />
            Apabila Anda Menyaksikan Live Streaming di <strong className="text-red-600">browser lain</strong>, Anda akan mengulangi <b className="text-red-600">pembayaran kembali</b>.
          </p>
          <button
            onClick={() => {
              console.log('🔄 PaymentWarningPopup: button clicked')
              onClose()
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  )
}
