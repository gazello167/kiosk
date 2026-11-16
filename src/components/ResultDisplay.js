'use client';

import { useState, useEffect } from 'react';

export default function ResultDisplay({ resultData, onRestart }) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    console.log('ResultDisplay mounted, resultData:', resultData);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRestart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRestart]);

  if (!resultData) {
    return (
      <div style={{padding: '40px', textAlign: 'center', color: 'red'}}>
        <h2>Error: No result data received</h2>
        <button onClick={onRestart}>Start Over</button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #7c3aed, #ec4899)',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{textAlign: 'center', marginBottom: '32px'}}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '8px'
        }}>
          ✨ Virtual Try-On Berhasil!
        </h1>
        <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem'}}>
          Generated in {resultData.generationTime}
        </p>
      </div>

      {/* Result Image */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '24px',
        marginBottom: '24px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }}>
        <img
          src={resultData.imageUrl}
          alt="Virtual Try-On Result"
          style={{
            width: '100%',
            borderRadius: '16px',
            display: 'block'
          }}
          onLoad={() => console.log('Image loaded successfully')}
          onError={(e) => {
            console.error('Image failed to load:', resultData.imageUrl);
            e.target.src = 'https://picsum.photos/400/600';
          }}
        />
      </div>

      {/* QR Code */}
      {resultData.qrCode && (
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            📱 Scan untuk Simpan
          </h2>
          <img
            src={resultData.qrCode}
            alt="QR Code"
            style={{width: '200px', height: '200px', margin: '0 auto', display: 'block'}}
          />
        </div>
      )}

      {/* Debug Info */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '24px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <p style={{color: 'white', fontSize: '0.85rem', fontFamily: 'monospace', margin: 0}}>
          Session: {resultData.sessionId}<br/>
          AI: {resultData.metadata && resultData.metadata.ai_model}<br/>
          DB: {String(resultData.dbSaved)}
        </p>
      </div>

      {/* Buttons */}
      <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
        <button
          onClick={onRestart}
          style={{
            background: 'white',
            color: '#7c3aed',
            padding: '16px 32px',
            borderRadius: '999px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🔄 Coba Lagi
        </button>
      </div>

      {/* Countdown */}
      <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem'}}>
        Auto restart dalam <strong style={{color: 'white', fontSize: '1.4rem'}}>{countdown}</strong> detik
      </p>
    </div>
  );
}
