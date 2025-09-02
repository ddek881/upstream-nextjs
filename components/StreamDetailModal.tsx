'use client'

import { Stream } from '@/lib/database'
import { X, Calendar, Clock } from 'lucide-react'
import { renderHtml } from '@/utils/textUtils'

interface StreamDetailModalProps {
  stream: Stream | null
  isOpen: boolean
  onClose: () => void
}

export default function StreamDetailModal({ stream, isOpen, onClose }: StreamDetailModalProps) {
  if (!isOpen || !stream) return null

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }) + ' WIB'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Detail Stream</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Image and Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-64 object-cover rounded-xl"
                />
                
                {/* Badges overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {Boolean(stream.is_popular) && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      🔥 Populer
                    </span>
                  )}
                  {Boolean(stream.is_paid) && stream.price > 0 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-lg bg-purple-500 text-white">
                      💰 Rp {stream.price.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Akan Datang
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {stream.title}
                  </h3>
                  
                  {/* Schedule Info */}
                  {stream.scheduled_time && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                        <Calendar size={16} className="text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">
                          {formatTime(stream.scheduled_time)}
                        </span>
                      </div>
                      
                      {stream.estimated_duration && (
                        <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600/50">
                          <Clock size={16} className="text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {stream.estimated_duration}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Kategori</h4>
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-slate-700/50 text-slate-300 border border-slate-600/50 capitalize">
                    {stream.category || 'Entertainment'}
                  </span>
                </div>

                {/* Access Type */}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Tipe Akses</h4>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${
                    Boolean(stream.is_paid) && stream.price > 0
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : 'bg-green-500/20 text-green-400 border-green-500/30'
                  }`}>
                    {Boolean(stream.is_paid) && stream.price > 0 
                      ? `Premium - Rp ${stream.price.toLocaleString()}`
                      : 'Gratis'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Deskripsi Lengkap</h4>
              <div 
                className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={renderHtml(stream.description)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              Stream akan dimulai sesuai jadwal yang telah ditentukan
            </div>
            <button
              onClick={onClose}
              className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-6 py-2 rounded-lg transition-all duration-200 border border-slate-600/50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
