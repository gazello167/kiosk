'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ResultDisplay({ resultData, onRestart }) {
  const [countdown, setCountdown] = useState(60);

  // ✅ Debug: log props yang diterima
  useEffect(() => {
    console.log('ResultDisplay received resultData:', resultData);
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

  // ✅ Guard: tampilkan error info kalau resultData undefined
  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ❌ No Result Data
          </h2>
          <p className="text-gray-600 mb-6">
            resultData is undefined or null
          </p>
          <button
            onClick={onRestart}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ✨ Virtual Try-On Result
          </h1>
          <p className="text-white/80">
            {resultData.generationTime} | {resultData.sessionId}
          </p>
        </div>

        {/* Result Image */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl">
          {resultData.imageUrl ? (
            <img
              src={resultData.imageUrl}
              alt="Result"
              className="w-full rounded-2xl object-cover"
              onError={(e) => {
                console.error('Image load error:', e);
                e.target.src = 'https://picsum.photos/400/600';
              }}
            />
          ) : (
            <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
              <p className="text-gray-500">No image URL</p>
            </div>
          )}
        </div>

        {/* QR Code */}
        {resultData.qrCode && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📱 Scan QR Code
            </h2>
            <img
              src={resultData.qrCode}
              alt="QR"
              className="w-48 h-48 mx-auto"
            />
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-black/20 rounded-2xl p-4 mb-6">
          <p className="text-white text-sm font-mono">
            Session: {resultData.sessionId}<br/>
            Model: {resultData.metadata?.ai_model}<br/>
            DB Saved: {String(resultData.dbSaved)}<br/>
            Time: {resultData.generationTime}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={onRestart}
            className="flex-1 bg-white text-purple-600 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all"
          >
            🔄 Coba Lagi
          </button>
        </div>

        {/* Countdown */}
        <div className="text-center">
          <p className="text-white text-lg">
            Auto restart dalam <strong>{countdown}</strong> detik
          </p>
        </div>
      </div>
    </div>
  );
}
