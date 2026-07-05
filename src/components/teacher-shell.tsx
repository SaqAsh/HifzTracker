'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';

type TeacherShellProps = {
  children: React.ReactNode;
};

function activeTab(
  pathname: string,
): 'lessons' | 'settings' | 'students' | 'subac' {
  if (pathname.startsWith('/settings')) {
    return 'settings';
  }

  if (pathname.startsWith('/subac')) {
    return 'subac';
  }

  if (pathname.startsWith('/students') || pathname.startsWith('/sessions')) {
    return 'students';
  }

  return 'lessons';
}

/** Teacher app frame with safe-area spacing and bottom tabs. */
export function TeacherShell({
  children,
}: TeacherShellProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <div className="safe-screen">
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-5 pb-28 sm:px-6 lg:px-8">
        {children}
      </main>
      <BottomNav active={activeTab(pathname)} />
    </div>
  );
}
