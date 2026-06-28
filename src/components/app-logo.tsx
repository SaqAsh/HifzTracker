type AppLogoProps = {
  size?: 'lg' | 'sm';
};

/** Branded Quran/book mark used in the header and auth screens. */
export function AppLogo({ size = 'sm' }: AppLogoProps): React.JSX.Element {
  const box = size === 'lg' ? 'h-16 w-16' : 'h-11 w-11';

  return (
    <div
      className={`${box} grid place-items-center rounded-[1.4rem] bg-cream shadow-sm ring-1 ring-teal/15`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-4/5 w-4/5">
        <path
          d="M32 16c-5.8-4.5-12-6.6-18.5-6.3A4.8 4.8 0 0 0 9 14.5v31.2c0 2.8 2.3 5 5.1 4.8 6.2-.4 12.2 1.4 17.9 5.5V16Z"
          fill="#2B6873"
        />
        <path
          d="M32 16c5.8-4.5 12-6.6 18.5-6.3a4.8 4.8 0 0 1 4.5 4.8v31.2c0 2.8-2.3 5-5.1 4.8-6.2-.4-12.2 1.4-17.9 5.5V16Z"
          fill="#93AD9F"
        />
        <path
          d="M18 21h7M18 29h8M18 37h7M46 21h-7M46 29h-8M46 37h-7"
          fill="none"
          stroke="#F3EFE2"
          strokeLinecap="round"
          strokeWidth="2.8"
        />
        <path
          d="M32 16v40"
          stroke="#CDAE82"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
