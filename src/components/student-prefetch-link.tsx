'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, type ComponentProps } from 'react';

type StudentPrefetchLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

/** Link that warms a student detail route as soon as the teacher shows intent. */
export function StudentPrefetchLink({
  href,
  onFocus,
  onPointerDown,
  onPointerEnter,
  onTouchStart,
  ...props
}: StudentPrefetchLinkProps): React.JSX.Element {
  const router = useRouter();
  const prefetched = useRef(false);

  function prefetchStudent(): void {
    if (prefetched.current) {
      return;
    }

    prefetched.current = true;
    router.prefetch(href);
  }

  return (
    <Link
      {...props}
      href={href}
      onFocus={(event) => {
        prefetchStudent();
        onFocus?.(event);
      }}
      onPointerDown={(event) => {
        prefetchStudent();
        onPointerDown?.(event);
      }}
      onPointerEnter={(event) => {
        prefetchStudent();
        onPointerEnter?.(event);
      }}
      onTouchStart={(event) => {
        prefetchStudent();
        onTouchStart?.(event);
      }}
    />
  );
}
