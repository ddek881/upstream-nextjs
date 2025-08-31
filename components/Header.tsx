'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="relative z-20 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-white font-bold text-xl">UpStream</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-orange-500 bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/category/entertainment"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/category/entertainment')
                  ? 'text-orange-500 bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Hiburan
            </Link>
            <Link
              href="/category/music"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/category/music')
                  ? 'text-orange-500 bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Musik
            </Link>
            <Link
              href="/category/sports"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/category/sports')
                  ? 'text-orange-500 bg-slate-800'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Olahraga
            </Link>
          </nav>

          {/* Admin Link */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
