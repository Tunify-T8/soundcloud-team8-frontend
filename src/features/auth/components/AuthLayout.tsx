import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top nav bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <a href="/" className="flex items-center gap-2">
          {/* SoundCloud logo */}
          <svg viewBox="0 0 240 100" className="h-8 w-auto fill-[#ff5500]">
            <path d="M0 67.5c0 7.7 6.2 13.9 13.9 13.9s13.9-6.2 13.9-13.9V32.5c0-7.7-6.2-13.9-13.9-13.9S0 24.8 0 32.5v35zm240-22.5c0-18.2-14.8-33-33-33-4.8 0-9.4 1-13.5 2.9C187.8 6.4 177.4 0 165.5 0c-18.2 0-33 14.8-33 33v56.4h107.5V45z" />
          </svg>
          <span className="text-white font-bold text-xl tracking-tight">
            SoundCloud
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/stream" className="text-white/70 hover:text-white text-sm transition-colors">
            Home
          </a>
          <a href="/stream" className="text-white/70 hover:text-white text-sm transition-colors">
            Feed
          </a>
          <a href="/stream" className="text-white/70 hover:text-white text-sm transition-colors">
            Library
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/signin"
            className="text-white text-sm font-medium hover:text-white/80 transition-colors"
          >
            Sign in
          </a>
          <a
            href="/create-account"
            className="border border-white/30 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:border-white/60 transition-colors"
          >
            Create account
          </a>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px] bg-[#141414] border border-white/10 rounded-xl p-8 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
