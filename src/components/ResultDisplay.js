'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { playSound, formatPhoneNumber } from '@/lib/utils';

export default function ResultDisplay({ 
  resultData, 
  selectedKain, 
  selectedModel,
  onRestart 
}) {
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    playSound('success');
    
    // Auto restart countdown
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

  const handleSendWhatsApp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Nomor WhatsApp tidak valid');
      return;
    }

    setSending(true);
    try {
      const formatted = formatPhoneNumber(phoneNumber);
      
      // Trigger webhook lagi untuk kirim WA
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'send_whatsapp',
          phone: formatted,
          result_url: resultData.short_url,
          qr_url: resultData.qr_code_url,
        }),
      });

      if (response.ok) {
        alert(`✅ Hasil sudah dikirim ke WhatsApp ${formatted}`);
        setShowWhatsAppForm(false);
        setPhoneNumber('');
      } else {
        alert('❌ Gagal mengirim WhatsApp. Coba lagi.');
      }
    } catch (error) {
      console.error('Send WA error:', error);
      alert('❌ Terjadi kesalahan. Coba lagi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-blue-500 overflow-hidden">
      <div className="w-full h-full flex flex-col p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            ✨ Hasil Virtual Try-On Anda
          </h1>
          <p className="text-xl text-white/90">
            Lihat bagaimana Anda tampil dengan kain pilihan!
          </p>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex gap-6">
          {/* Result image */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="relative w-full h-full">
              <Image
                src={resultData.result_url}
                alt="Try-on result"
                fill
                className="object-contain"
                priority
              />
              
              {/* Watermark */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                Simulasi AI - Toko Kain Virtual Try-On
              </div>
            </div>
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-96 flex flex-col gap-4"
          >
            {/* Detail kain & model */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Detail Pilihan
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={selectedKain.foto_url}
                      alt={selectedKain.kode}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kain</p>
                    <p className="font-semibold text-gray-800">{selectedKain.kode}</p>
                    <p className="text-sm text-primary-600">
                      Rp {selectedKain.harga_per_meter?.toLocaleString('id-ID')}/m
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={selectedModel.foto_referensi_url}
                      alt={selectedModel.nama}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-semibold text-gray-800 line-clamp-2">
                      {selectedModel.nama}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Scan untuk Simpan
              </h3>
              <div className="bg-gray-100 p-4 rounded-xl inline-block">
                <QRCodeSVG
                  value={resultData.short_url || resultData.result_url}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Scan dengan HP untuk menyimpan hasil
              </p>
            </div>

            {/* WhatsApp button */}
            <AnimatePresence mode="wait">
              {!showWhatsAppForm ? (
                <motion.button
                  key="show-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowWhatsAppForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-xl touch-feedback transition"
                >
                  📱 Kirim ke WhatsApp
                </motion.button>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-4 shadow-xl"
                >
                  <input
                    type="tel"
                    placeholder="08xx atau +628xxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl mb-3 text-lg focus:border-green-500 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendWhatsApp}
                      disabled={sending}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 touch-feedback"
                    >
                      {sending ? 'Mengirim...' : 'Kirim'}
                    </button>
                    <button
                      onClick={() => setShowWhatsAppForm(false)}
                      className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl touch-feedback"
                    >
                      Batal
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom actions */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-6"
        >
          <button
            onClick={onRestart}
            className="bg-white text-gray-800 px-12 py-5 rounded-full text-2xl font-bold shadow-xl hover:bg-gray-100 transition touch-feedback"
          >
            🔄 Coba Lagi
          </button>

          <div className="bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full">
            <p className="text-white text-xl font-semibold">
              Otomatis restart dalam <span className="text-3xl">{countdown}</span> detik
            </p>
          </div>

          <div className="w-48" /> {/* Spacer */}
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-white/70 text-sm mt-4"
        >
          ⚠️ Hasil adalah simulasi AI. Warna, tekstur, dan jatuhnya kain aktual mungkin berbeda.
          Silakan coba kain secara langsung untuk hasil terbaik.
        </motion.p>
      </div>
    </div>
  );
}
