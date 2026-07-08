import { clsx } from 'clsx';
import Link from 'next/link';

type BottomNavProps = {
  active: 'lessons' | 'settings' | 'students' | 'subac';
};

const NAV_ITEMS = [
  { href: '/students', key: 'students', label: 'Students' },
  { href: '/lessons', key: 'lessons', label: 'Lessons' },
  { href: '/subac', key: 'subac', label: 'Subac' },
  { href: '/settings', key: 'settings', label: 'Settings' },
] as const;

/** Thumb-friendly teacher navigation for installed iPhone usage. */
export function BottomNav({ active }: BottomNavProps): React.JSX.Element {
  return (
    <nav
      aria-label="Teacher"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-teal/15 bg-cream px-4 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-16px_40px_rgba(43,104,115,0.12)] backdrop-blur"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;

          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'tap-target grid place-items-center rounded-2xl text-sm font-semibold transition',
                isActive
                  ? 'border border-teal bg-cream text-teal shadow-sm ring-2 ring-sand/30'
                  : 'border border-teal/20 bg-cream text-teal hover:bg-teal/10',
              )}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
