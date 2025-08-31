'use client'

import { useState, useEffect } from 'react'

interface Payment {
  id: number
  user_id: string
  stream_id: string
  trx_id: string
  amount: number
  status: 'pending' | 'paid' | 'expired' | 'failed'
  paid_at?: string
  expires_at: string
  created_at?: string
  updated_at?: string
  stream_title?: string
}

export default function ApprovePaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Get all active payments
  const getPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user-sessions')
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Approve payment for specific stream
  const approvePayment = async (streamId: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/force-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamId, userId: 'demo-user' })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(`✅ Payment berhasil diapprove untuk stream ${streamId}`)
        // Refresh payments
        setTimeout(getPayments, 1000)
      } else {
        const errorData = await response.json()
        setMessage(`❌ Gagal approve: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error approving payment:', error)
      setMessage('❌ Error approving payment')
    } finally {
      setLoading(false)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  // Calculate remaining time
  const getRemainingTime = (expiresAt: string) => {
    const now = new Date().getTime()
    const expires = new Date(expiresAt).getTime()
    const remaining = Math.max(0, expires - now)
    return Math.floor(remaining / 1000)
  }

  useEffect(() => {
    getPayments()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔐 Admin - Payment Management</h1>
          <p className="text-gray-400">Kelola pembayaran dan akses user</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'
          }`}>
            {message}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => approvePayment('2')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? '🔄 Approving...' : '✅ Approve Stream 2'}
            </button>
            <button
              onClick={() => approvePayment('4')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? '🔄 Approving...' : '✅ Approve Stream 4'}
            </button>
            <button
              onClick={getPayments}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh Payments'}
            </button>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Active Payments</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Tidak ada active payments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left p-2">TRX ID</th>
                    <th className="text-left p-2">User ID</th>
                    <th className="text-left p-2">Stream ID</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Paid At</th>
                    <th className="text-left p-2">Expires At</th>
                    <th className="text-left p-2">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-700">
                      <td className="p-2 font-mono text-xs">{payment.trx_id}</td>
                      <td className="p-2 font-mono text-xs">{payment.user_id.slice(0, 20)}...</td>
                      <td className="p-2">{payment.stream_id}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payment.status === 'paid' ? 'bg-green-600/50 text-green-300' :
                          payment.status === 'pending' ? 'bg-yellow-600/50 text-yellow-300' :
                          payment.status === 'expired' ? 'bg-red-600/50 text-red-300' :
                          'bg-gray-600/50 text-gray-300'
                        }`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2">Rp {payment.amount.toLocaleString()}</td>
                      <td className="p-2 text-xs">
                        {payment.paid_at ? formatDate(payment.paid_at) : '-'}
                      </td>
                      <td className="p-2 text-xs">{formatDate(payment.expires_at)}</td>
                      <td className="p-2 text-xs">
                        {payment.status === 'paid' ? formatTime(getRemainingTime(payment.expires_at)) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
