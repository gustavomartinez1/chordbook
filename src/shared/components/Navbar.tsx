import Link from 'next/link';
import { createClient } from '@/shared/lib/supabase/server';
import { AuthButton } from '@/shared/components/AuthButton';

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight hover:text-amber-400 transition-colors"
        >
          <span className="text-amber-400/80">♫</span>
          CHORDBOOK
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Canciones
          </Link>
          <AuthButton user={user} />
        </div>
      </nav>
    </header>
  );
}
