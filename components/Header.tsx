'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="relative z-20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center h-20">
          {/* Logo with SVG */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* SVG Logo */}
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 40 40" 
                className="group-hover:scale-110 transition-transform duration-300"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
                <path 
                  d="M15 12 L15 28 L28 20 Z" 
                  fill="white" 
                  className="drop-shadow-sm"
                />
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              </svg>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
            </div>
            
            {/* Brand Name */}
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent group-hover:from-orange-300 group-hover:via-yellow-300 group-hover:to-orange-400 transition-all duration-300">
                UpStream
              </span>
              <span className="text-xs text-slate-400 font-medium tracking-wider -mt-1">
                LIVE STREAMING
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
