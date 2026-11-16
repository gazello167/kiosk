'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function UploadSubject({ onNext }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (preview) {
      onNext({ subjectPhoto: preview });
    }
  };

  return (
    <div className="min-h-screen min-h-dvh overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8 max-w-lg w-full mx-auto"
      >
        <h2 className="text-xl sm:text-3xl font-bold text-purple-800 mb-4 sm:mb-6 text-center">
          Upload Foto Anda
        </h2>
        
        <div className="mb-4 sm:mb-6">
          <label 
            htmlFor="subject-upload"
            className="block w-full h-64 sm:h-96 border-4 border-dashed border-purple-300 rounded-2xl cursor-pointer hover:border-purple-500 transition-all relative overflow-hidden group"
          >
            {preview ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-purple-400 group-hover:text-purple-600 px-4">
                <svg className="w-14 h-14 sm:w-20 sm:h-20 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-base sm:text-xl font-semibold text-center">Klik untuk upload foto</p>
                <p className="text-xs sm:text-sm mt-2 text-center">Format: JPG, PNG (Max 5MB)</p>
              </div>
            )}
            <input
              id="subject-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Tips */}
        <div className="bg-purple-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">Tips Foto Terbaik:</h3>
          <ul className="text-xs sm:text-sm text-purple-700 space-y-1">
            <li>✓ Berdiri tegak menghadap kamera</li>
            <li>✓ Background polos (putih/abu-abu)</li>
            <li>✓ Pencahayaan terang dan merata</li>
            <li>✓ Pakai pakaian polos (tidak bermotif)</li>
            <li>✓ Foto seluruh badan terlihat jelas</li>
          </ul>
        </div>

        <button
          onClick={handleNext}
          disabled={!preview}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 sm:py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform text-sm sm:text-base"
        >
          Lanjutkan
        </button>
      </motion.div>
    </div>
  );
}
