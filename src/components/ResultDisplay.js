'use client';

import { useState, useEffect } from 'react';

export default function ResultDisplay({ resultData, onRestart }) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    console.log('ResultDisplay mounted:', resultData);
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
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Data tidak ditemukan
          </h2>
          <button
            onClick={onRestart}
            className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold"
          >
            Mulai Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-purple-500 to-pink-500 py-6 px-4 overflow-y-auto">
      <div className="max-w-md mx-auto pb-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            ✨ Try-On Berhasil!
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            Generated in {resultData.generationTime}
          </p>
        </div>

        {/* Result Image */}
        <div className="bg-white rounded-3xl p-4 mb-4 shadow-2xl">
          <img
            src={resultData.imageUrl}
            alt="Virtual Try-On Result"
            className="w-full rounded-2xl object-cover"
            onError={(e) => {
              console.error('Image load failed');
              e.target.src = 'https://picsum.photos/400/600';
            }}
          />
        </div>

        {/* QR Code */}
        {resultData.qrCode && (
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-2xl text-center">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              📱 Scan untuk Simpan
            </h2>
            <div className="bg-gray-50 p-4 rounded-2xl inline-block">
              <img
                src={resultData.qrCode}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Scan dengan HP untuk simpan
            </p>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-black/20 backdrop-blur rounded-2xl p-3 mb-6">
          <p className="text-white text-xs font-mono text-center break-all">
            {resultData.sessionId}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRestart}
            className="w-full bg-white text-purple-600 py-4 rounded-2xl font-bold text-lg shadow-lg touch-feedback active:scale-95 transition-transform"
          >
            🔄 Coba Lagi
          </button>
          
          <button
            onClick={() => window.print()}
            className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg touch-feedback active:scale-95 transition-transform"
          >
            🖨️ Print / Download
          </button>
        </div>

        {/* Countdown */}
        <div className="mt-6 bg-white/20 backdrop-blur rounded-full px-6 py-3 text-center">
          <p className="text-white font-semibold">
            Auto restart dalam <span className="text-2xl font-bold">{countdown}</span>s
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-white/60 text-xs mt-6 px-4">
          ⚠️ Hasil adalah simulasi AI. Warna dan tekstur aktual mungkin berbeda.
        </p>
      </div>
    </div>
  );
}
