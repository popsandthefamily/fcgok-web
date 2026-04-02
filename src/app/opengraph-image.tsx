import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Frontier Consulting Group — Technology, Consulting & Connections in Broken Bow & Hochatown, Oklahoma';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1a3a2a 0%, #122a1e 50%, #0f1f17 100%)',
          position: 'relative',
        }}
      >
        {/* Subtle diagonal lines overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.04,
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 40px, white 40px, white 41px)',
          }}
        />

        {/* Logo */}
        <img
          src="https://fcgok.com/logos/fcg-logo-white.png"
          width={400}
          height={202}
          style={{ opacity: 0.95 }}
        />

        {/* Tagline */}
        <div
          style={{
            marginTop: 32,
            fontSize: 22,
            color: 'rgba(244, 241, 234, 0.5)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          Broken Bow &amp; Hochatown, Oklahoma
        </div>

        {/* Gold accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: '#dbb532',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
