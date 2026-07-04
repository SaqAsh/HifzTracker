import { ImageResponse } from 'next/og';

export const alt = 'Quran Teacher book logo';
export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

function BookMark(): React.JSX.Element {
  return (
    <svg
      height="260"
      viewBox="0 0 64 64"
      width="260"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#F3EFE2" height="64" rx="18" width="64" />
      <path
        d="M32 16C26.2 11.5 20 9.4 13.5 9.7A4.8 4.8 0 0 0 9 14.5V45.7C9 48.5 11.3 50.7 14.1 50.5C20.3 50.1 26.3 51.9 32 56V16Z"
        fill="#2B6873"
      />
      <path
        d="M32 16C37.8 11.5 44 9.4 50.5 9.7A4.8 4.8 0 0 1 55 14.5V45.7C55 48.5 52.7 50.7 49.9 50.5C43.7 50.1 37.7 51.9 32 56V16Z"
        fill="#93AD9F"
      />
      <path
        d="M18 21H25M18 29H26M18 37H25M46 21H39M46 29H38M46 37H39"
        fill="none"
        stroke="#F3EFE2"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <path
        d="M32 16V56"
        stroke="#CDAE82"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#F3EFE2',
          color: '#2B6873',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 34,
          }}
        >
          <BookMark />
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: 0,
              lineHeight: 1,
            }}
          >
            Quran Teacher
          </div>
          <div
            style={{
              color: '#4E5D58',
              fontSize: 34,
              fontWeight: 500,
              letterSpacing: 0,
            }}
          >
            Lesson scheduling and session tracking
          </div>
        </div>
      </div>
    ),
    size,
  );
}
