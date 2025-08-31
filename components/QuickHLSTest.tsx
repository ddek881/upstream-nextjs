'use client'

import { useState, useRef } from 'react'
import Hls from 'hls.js'

export default function QuickHLSTest() {
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const testTRCell = () => {
    console.log('=== Quick TR Cell Test ===')
    setStatus('Testing...')
    setError('')
    
    if (!videoRef.current) {
      setError('Video element not found')
      return
    }

    const video = videoRef.current
    const url = 'https://stream.trcell.id/hls/byon2.m3u8'
    
    console.log('URL:', url)
    console.log('HLS.js Supported:', Hls.isSupported())
    
    // Clean up
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    video.src = ''
    
    if (Hls.isSupported()) {
      try {
        console.log('Creating HLS instance...')
        hlsRef.current = new Hls({ debug: true })
        
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Manifest parsed - playing video')
          setStatus('Playing...')
          video.play().then(() => {
            console.log('✅ Video playing successfully')
            setStatus('Playing TR Cell')
          }).catch(err => {
            console.error('❌ Play failed:', err)
            setError(`Play failed: ${err.message}`)
            setStatus('Play failed')
          })
        })
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS Error:', data)
          setError(`HLS Error: ${data.type} - ${data.details}`)
          setStatus('HLS Error')
        })
        
        console.log('Loading source...')
        hlsRef.current.loadSource(url)
        hlsRef.current.attachMedia(video)
        
      } catch (err) {
        console.error('❌ HLS creation failed:', err)
        setError(`HLS creation failed: ${err}`)
        setStatus('Creation failed')
      }
    } else {
      setError('HLS.js not supported')
      setStatus('Not supported')
    }
  }

  const stop = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
    }
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    setStatus('Stopped')
    setError('')
  }

  return (
    <div className="p-3 bg-yellow-100 border border-yellow-300 rounded max-w-sm">
      <h4 className="font-bold text-sm mb-2">🚨 Quick HLS Test</h4>
      
      <video
        ref={videoRef}
        className="w-full h-20 bg-black rounded mb-2"
        controls
        muted
      />
      
      <div className="text-xs mb-2">
        <div>Status: {status}</div>
        {error && <div className="text-red-600">Error: {error}</div>}
      </div>
      
      <div className="space-y-1">
        <button
          onClick={testTRCell}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          Test TR Cell
        </button>
        <button
          onClick={stop}
          className="w-full bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
        >
          Stop
        </button>
      </div>
    </div>
  )
}
