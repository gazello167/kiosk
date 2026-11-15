'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function UploadGarment({ onGenerate, onBack }) {
  const [garmentPhoto, setGarmentPhoto] = useState(null);
  const [category, setCategory] = useState('');

  const categories = [
    {
      value: 'atasan',
      label: 'Atasan / Jaket / Sweater',
      crop: 'half_body',
      cropHeightPercentage: 50,
      icon: '👚',
      desc: 'Hanya setengah badan (dada ke atas)'
    },
    {
      value: 'tunik',
      label: 'Tunik',
      crop: 'three_quarter',
      cropHeightPercentage: 75,
      icon: '👗',
      desc: 'Lebih panjang (lutut ke atas)'
    },
    {
      value: 'dress',
      label: 'Dress / Gamis',
      crop: 'full_body',
      cropHeightPercentage: 100,
      icon: '👘',
      desc: 'Seluruh badan (hingga kaki)'
    },
    {
      value: 'setelan',
      label: 'Setelan',
      crop: 'full_body',
      cropHeightPercentage: 100,
      icon: '👔',
      desc: 'Atasan + Celana/Rok'
    }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setGarmentPhoto(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (garmentPhoto && category) {
      const selectedCat = categories.find(c => c.value === category);
      onGenerate({
        garmentPhoto,
        category: selectedCat
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full"
      >
        <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">
          Upload Foto Pakaian
        </h2>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Upload area */}
          <div>
            <label 
              htmlFor="garment-upload"
              className="block w-full h-96 border-4 border-dashed border-purple-300 rounded-2xl cursor-pointer hover:border-purple-500 transition-all relative overflow-hidden group"
            >
              {garmentPhoto ? (
                <img 
                  src={garmentPhoto} 
                  alt="Garment" 
                  className="w-full h-full object-contain bg-gray-50"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-purple-400 group-hover:text-purple-600">
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xl font-semibold">Upload Foto Pakaian</p>
                  <p className="text-sm mt-2">Background putih/polos</p>
                </div>
              )}
              <input
                id="garment-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Category selection */}
          <div>
            <h3 className="font-semibold text-purple-800 mb-4 text-lg">
              Pilih Kategori Pakaian:
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                    category === cat.value
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-purple-200 hover:border-purple-400'
                  }`}
                >
                  <div className="text-4xl">{cat.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-purple-800 mb-1">
                      {cat.label}
                    </div>
                    <div className="text-sm text-purple-600">
                      {cat.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Tips Foto Pakaian:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ Foto hanya pakaian (tidak dipakai)</li>
            <li>✓ Background putih atau polos</li>
            <li>✓ Pencahayaan merata tanpa bayangan</li>
            <li>✓ Pakaian terlihat jelas dan tidak terlipat</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-800 font-bold py-4 rounded-xl hover:bg-gray-300 transition-all"
          >
            Kembali
          </button>
          <button
            onClick={handleGenerate}
            disabled={!garmentPhoto || !category}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Generate Virtual Try-On
          </button>
        </div>
      </motion.div>
    </div>
  );
}
