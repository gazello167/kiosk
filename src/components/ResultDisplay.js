'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export default function ResultDisplay({ 
  resultData, 
  onRestart 
}) {
  const [countdown, setCountdown] = useState(60);

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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-500 to-pink-500 overflow-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            ✨ Virtual Try-On Berhasil!
          </h1>
          <p className="text-2xl text-white/90">
            Generated in {resultData.generationTime || 'N/A'}
          </p>
        </motion.div>

        {/* Result Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-6 mb-8 max-w-4xl w-full"
        >
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden">
            <img
              src={resultData.imageUrl}
              alt="Virtual Try-On Result"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Session Info */}
          <div className="mt-6 p-4 bg-purple-50 rounded-xl text-center">
            <p className="text-sm text-gray-600">
              <strong>Session:</strong> {resultData.sessionId}
            </p>
            {resultData.metadata?.ai_model && (
              <p className="text-sm text-gray-600">
                <strong>AI Model:</strong> {resultData.metadata.ai_model}
              </p>
            )}
          </div>
        </motion.div>

        {/* QR Code */}
        {resultData.qrCode && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-center text-purple-900 mb-4">
              📱 Scan untuk Simpan
            </h2>
            <div className="bg-gray-100 p-6 rounded-2xl inline-block">
              <img 
                src={resultData.qrCode} 
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
            <p className="text-center text-gray-600 mt-4">
              Scan dengan HP untuk simpan hasil
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <button
            onClick={onRestart}
            className="bg-white text-purple-600 px-12 py-5 rounded-full text-2xl font-bold shadow-xl hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            🔄 Coba Lagi
          </button>

          <button
            onClick={() => window.print()}
            className="bg-green-500 text-white px-12 py-5 rounded-full text-2xl font-bold shadow-xl hover:bg-green-600 transition-all transform hover:scale-105"
          >
            🖨️ Print/Download
          </button>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full"
        >
          <p className="text-white text-xl font-semibold">
            Otomatis restart dalam <span className="text-3xl">{countdown}</span> detik
          </p>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/70 text-sm mt-8 max-w-2xl"
        >
          ⚠️ Hasil adalah simulasi AI. Warna, tekstur, dan jatuhnya kain aktual mungkin berbeda.
          Silakan coba kain secara langsung untuk hasil terbaik.
        </motion.p>
      </div>
    </div>
  );
}
