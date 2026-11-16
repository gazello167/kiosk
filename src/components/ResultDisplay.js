'use client';

import { useState, useEffect } from 'react';

export default function ResultDisplay({ resultData, onRestart }) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    console.log('ResultDisplay mounted, resultData:', resultData);
    console.log('QR Code exists:', !!resultData?.qrCode);
  }, [resultData]);

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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #7c3aed, #ec4899)',
        color: 'white'
      }}>
        <div style={{textAlign: 'center'}}>
          <h2>Error: No result data</h2>
          <button onClick={onRestart} style={{
            marginTop: '20px',
            padding: '12px 24px',
            background: 'white',
            color: '#7c3aed',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Start Over
          </button>
        </div>
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
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
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

      {/* QR Code Section */}
      {resultData.qrCode ? (
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            📱 Scan untuk Simpan
          </h2>
          <div style={{
            background: '#f3f4f6',
            padding: '20px',
            borderRadius: '16px',
            display: 'inline-block'
          }}>
            <img
              src={resultData.qrCode}
              alt="QR Code"
              style={{
                width: '200px',
                height: '200px',
                display: 'block',
                borderRadius: '8px'
              }}
              onLoad={() => console.log('QR loaded successfully')}
              onError={(e) => {
                console.error('QR failed to load');
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{
              display: 'none',
              width: '200px',
              height: '200px',
              background: '#e5e7eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}>
              QR Load Failed
            </div>
          </div>
          <p style={{
            marginTop: '16px',
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            Scan dengan HP untuk simpan hasil
          </p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '24px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <p style={{color: 'white'}}>QR Code not available</p>
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
        <p style={{
          color: 'white',
          fontSize: '0.85rem',
          fontFamily: 'monospace',
          margin: 0,
          wordBreak: 'break-all'
        }}>
          Session: {resultData.sessionId}<br/>
          AI: {resultData.metadata?.ai_model || 'N/A'}<br/>
          DB: {String(resultData.dbSaved)}<br/>
          QR Length: {resultData.qrCode ? resultData.qrCode.length : 0}
        </p>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
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
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          🔄 Coba Lagi
        </button>
        
        <button
          onClick={() => window.print()}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '999px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            border: '2px solid white',
            cursor: 'pointer'
          }}
        >
          🖨️ Print
        </button>
      </div>

      {/* Countdown */}
      <p style={{
        color: 'rgba(255,255,255,0.8)',
        fontSize: '1.1rem',
        marginTop: '16px'
      }}>
        Auto restart dalam <strong style={{color: 'white', fontSize: '1.4rem'}}>{countdown}</strong> detik
      </p>
    </div>
  );
}
