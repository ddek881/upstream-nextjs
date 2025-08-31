'use client'

import { useState, useEffect } from 'react'

export default function VideoDebug() {
  const [debugInfo, setDebugInfo] = useState({
    hlsSupported: false,
    userAgent: '',
    videoSupport: {
      hls: false,
      mp4: false,
      webm: false
    }
  })

  useEffect(() => {
    // Check HLS support
    const checkHLSSupport = async () => {
      try {
        const { default: Hls } = await import('hls.js')
        setDebugInfo(prev => ({
          ...prev,
          hlsSupported: Hls.isSupported()
        }))
      } catch (error) {
        console.error('HLS.js not available:', error)
      }
    }

    checkHLSSupport()

    // Check video format support
    const video = document.createElement('video')
    setDebugInfo(prev => ({
      ...prev,
      userAgent: navigator.userAgent,
      videoSupport: {
        hls: video.canPlayType('application/vnd.apple.mpegurl') !== '',
        mp4: video.canPlayType('video/mp4') !== '',
        webm: video.canPlayType('video/webm') !== ''
      }
    }))
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-md">
      <h3 className="text-lg font-bold mb-4">Video Debug Info</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>HLS.js Supported:</strong> {debugInfo.hlsSupported ? '✅ Yes' : '❌ No'}
        </div>
        
        <div>
          <strong>Browser:</strong> {debugInfo.userAgent}
        </div>
        
        <div>
          <strong>Video Format Support:</strong>
          <ul className="ml-4 mt-1">
            <li>HLS: {debugInfo.videoSupport.hls ? '✅' : '❌'}</li>
            <li>MP4: {debugInfo.videoSupport.mp4 ? '✅' : '❌'}</li>
            <li>WebM: {debugInfo.videoSupport.webm ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <strong>Test URLs:</strong>
          <ul className="ml-4 mt-1">
            <li>TR Cell: stream.trcell.id/hls/byon2.m3u8</li>
            <li>Mux: test-streams.mux.dev/x36xhzz/x36xhzz.m3u8</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
