'use client'

import { useState, useEffect } from 'react'
import { Stream, Category } from '@/lib/database'
import { X, Save, Plus } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'


interface StreamFormProps {
  stream?: Stream | null
  isOpen: boolean
  onClose: () => void
  onSave: (stream: Partial<Stream>) => void
}

export default function StreamForm({ stream, isOpen, onClose, onSave }: StreamFormProps) {
  const [formData, setFormData] = useState<Partial<Stream>>({
    title: '',
    description: '',
    thumbnail: '',
    url: '',
    category: '',
    is_live: false,
    is_paid: false,
    is_visible: true,
    is_popular: false,
    price: 0,
    scheduled_time: '',
    estimated_duration: '',
    chat_live: '',
    chat_nolive: '',
    view: 0
  })

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (stream) {
      setFormData({
        ...stream,
        // Normalize types coming from DB (numbers 0/1 -> booleans, etc.)
        is_live: Boolean(stream.is_live),
        is_paid: Boolean(stream.is_paid),
        is_visible: Boolean(stream.is_visible),
        is_popular: Boolean(stream.is_popular),
        price: Number(stream.price) || 0,
        view: Number(stream.view) || 0,
        scheduled_time: stream.scheduled_time ? new Date(stream.scheduled_time).toISOString().slice(0, 16) : ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        url: '',
        category: '',
        is_live: false,
        is_paid: false,
        is_visible: true,
        is_popular: false,
        price: 0,
        scheduled_time: '',
        estimated_duration: '',
        chat_live: '',
        chat_nolive: '',
        view: 0
      })
    }
  }, [stream])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const submitData = {
        ...formData,
        // Ensure boolean values are properly converted
        is_live: Boolean(formData.is_live),
        is_paid: Boolean(formData.is_paid),
        is_visible: Boolean(formData.is_visible),
        is_popular: Boolean(formData.is_popular),
        // Ensure numeric values are properly converted
        price: formData.is_paid ? Number(formData.price) || 0 : 0,
        view: Number(formData.view) || 0,
        // Handle scheduled_time properly
        scheduled_time: formData.scheduled_time ? new Date(formData.scheduled_time).toISOString() : undefined,
        // Ensure string values are properly handled
        category: formData.category || 'entertainment',
        // Ensure URL present for update endpoint
        url: formData.url || 'https://stream.trcell.id/hls/byon2.m3u8',
        chat_live: formData.chat_live || '',
        chat_nolive: formData.chat_nolive || '',
        estimated_duration: formData.estimated_duration || ''
      }
      
      console.log('Submitting stream data:', submitData)
      
      await onSave(submitData)
    } catch (error) {
      console.error('Error saving stream:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {stream ? 'Edit Stream' : 'Tambah Stream Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Judul Stream *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Masukkan judul stream"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kategori
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deskripsi
            </label>
            <RichTextEditor
              value={formData.description || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Masukkan deskripsi stream dengan format yang diinginkan..."
            />
            <div className="mt-2 text-xs text-slate-400">
              Gunakan toolbar di atas untuk memformat teks. Konten akan ditampilkan dengan format HTML di halaman stream.
            </div>
          </div>

          {/* Media URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Stream URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="https://example.com/stream.m3u8"
              />
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_live"
                checked={formData.is_live}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Live</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_paid"
                checked={formData.is_paid}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Premium</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_visible"
                checked={formData.is_visible}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Visible</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_popular"
                checked={formData.is_popular}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Popular</span>
            </label>
          </div>

          {/* Price */}
          {formData.is_paid && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Harga (Rp)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="1000"
              />
            </div>
          )}

          {/* Scheduled Time */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Waktu Jadwal {formData.is_live && '(Tidak berlaku jika Live)'}
            </label>
            <input
              type="datetime-local"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleInputChange}
              disabled={formData.is_live}
              className={`w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 ${
                formData.is_live ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            {formData.is_live && (
              <p className="text-xs text-slate-400 mt-1">
                Field ini dinonaktifkan karena stream sedang live
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Estimasi Durasi
            </label>
            <input
              type="text"
              name="estimated_duration"
              value={formData.estimated_duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="2 jam 30 menit"
            />
          </div>

          {/* View Count */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Jumlah View (Manual)
            </label>
            <input
              type="number"
              name="view"
              value={formData.view}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1">
              Jumlah view manual yang akan ditambahkan ke total view count. Total view = Manual view + Viewers table count.
            </p>
          </div>

          {/* Chat Live Messages */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chat Live (Pesan untuk saat stream live)
            </label>
            <textarea
              name="chat_live"
              value={formData.chat_live}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="Mantap nih streamnya,Gas live terus,Keren abis kontennya (pisahkan dengan koma)"
            />
            <p className="text-xs text-slate-400 mt-1">
              Pisahkan setiap pesan dengan koma (,). Contoh: &quot;Mantap nih,Gas live,Keren abis&quot;
            </p>
          </div>

          {/* Chat No Live Messages */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chat Belum Live (Pesan untuk saat stream belum dimulai)
            </label>
            <textarea
              name="chat_nolive"
              value={formData.chat_nolive}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="Kapan mulai nih?,Udah gak sabar nunggu,Jam berapa ya? (pisahkan dengan koma)"
            />
            <p className="text-xs text-slate-400 mt-1">
              Pisahkan setiap pesan dengan koma (,). Contoh: &quot;Kapan mulai?,Udah gak sabar,Jam berapa?&quot;
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : stream ? (
                <Save size={16} />
              ) : (
                <Plus size={16} />
              )}
              {stream ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
