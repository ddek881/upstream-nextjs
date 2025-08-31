'use client'

import { useState, useRef, useEffect } from 'react'
import Hls from 'hls.js'

export default function TestVideo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [hlsSupported, setHlsSupported] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    setHlsSupported(Hls.isSupported())
    console.log('HLS.js supported:', Hls.isSupported())
  }, [])

  const testStreams = [
    {
      name: 'TR Cell Stream',
      url: 'https://stream.trcell.id/hls/byon2.m3u8'
    },
    {
      name: 'Test Stream',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
    }
  ]

  const playVideo = (url: string) => {
    console.log('Testing video URL:', url)
    setVideoError(false)
    setIsPlaying(true)
    
    if (videoRef.current) {
      const video = videoRef.current
      
      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      
      // Reset video
      video.src = ''
      
      if (Hls.isSupported()) {
        console.log('Using HLS.js for:', url)
        
        // Create new HLS instance
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        })
        
        hlsRef.current.loadSource(url)
        hlsRef.current.attachMedia(video)
        
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed, starting playback')
          video.play().catch(error => {
            console.error('HLS video play failed:', error)
            setVideoError(true)
          })
        })
        
        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data)
          setVideoError(true)
        })
        
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('Using native HLS support for:', url)
        // Native HLS support (Safari)
        video.src = url
        video.play().catch(error => {
          console.error('Native HLS video play failed:', error)
          setVideoError(true)
        })
      } else {
        console.error('HLS not supported in this browser')
        setVideoError(true)
      }
      
      // Add video event listeners
      video.addEventListener('loadstart', () => {
        console.log('Video load started')
      })
      
      video.addEventListener('loadeddata', () => {
        console.log('Video data loaded')
      })
      
      video.addEventListener('canplay', () => {
        console.log('Video can play')
      })
      
      video.addEventListener('playing', () => {
        console.log('Video is playing')
      })
      
      video.addEventListener('error', (e) => {
        console.error('Video error event:', e)
        console.error('Video error details:', video.error)
        setVideoError(true)
      })
    }
  }

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
    }
    
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
    
    setIsPlaying(false)
    setVideoError(false)
  }

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-md">
      <h3 className="text-lg font-bold mb-4">Test Video Player</h3>
      
      <div className="mb-4">
        <video
          ref={videoRef}
          className="w-full h-32 bg-black rounded"
          controls
          muted
        />
      </div>
      
      <div className="mb-4 text-xs text-gray-600">
        <p>HLS.js Supported: {hlsSupported ? 'Yes' : 'No'}</p>
        <p>Status: {isPlaying ? 'Playing' : 'Stopped'}</p>
        <p>Error: {videoError ? 'Yes' : 'No'}</p>
      </div>
      
      {videoError && (
        <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          Video error occurred. Check console for details.
        </div>
      )}
      
      <div className="space-y-2">
        {testStreams.map((stream, index) => (
          <button
            key={index}
            onClick={() => playVideo(stream.url)}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            Test {stream.name}
          </button>
        ))}
        
        <button
          onClick={stopVideo}
          className="w-full bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
        >
          Stop Video
        </button>
      </div>
    </div>
  )
}
