'use client';

import Link from 'next/link';
import { useState } from 'react';
import AdminPinDialog from './AdminPinDialog';

function getInitialAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  try { return sessionStorage.getItem('chordbook_pin') !== null; } catch { return false; }
}

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(getInitialAdmin);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleAdminSuccess = (_pin: string) => {
    setIsAdmin(true);
    setShowPinDialog(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('chordbook_pin');
    setIsAdmin(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-100">
            <span className="text-amber-400">♪</span>
            CHORDBOOK
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Link href="/canciones/nueva" className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-500">
                  + Nueva
                </Link>
                <button onClick={handleLogout} className="rounded-lg border border-zinc-700 px-2 py-1.5 text-xs text-zinc-500 transition hover:text-zinc-300">
                  Salir
                </button>
              </>
            )}
            {!isAdmin && (
              <button onClick={() => setShowPinDialog(true)} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200">
                🔒 Admin
              </button>
            )}
          </div>
        </div>
      </nav>

      <AdminPinDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={handleAdminSuccess}
      />
    </>
  );
}
