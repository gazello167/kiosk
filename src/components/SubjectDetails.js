'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SubjectDetails({ subjectData, onNext, onBack }) {
  const [details, setDetails] = useState({
    tinggi: '',
    berat: '',
    bodyType: 'average',
    ageRange: 'adult'
  });

  const bodyTypes = [
    { value: 'petite', label: 'Petite', icon: '👧' },
    { value: 'slim', label: 'Slim', icon: '🧘‍♀️' },
    { value: 'average', label: 'Average', icon: '🙋‍♀️' },
    { value: 'curvy', label: 'Curvy', icon: '💃' },
    { value: 'plus_size', label: 'Plus Size', icon: '👩' }
  ];

  const handleNext = () => {
    if (details.tinggi && details.berat) {
      onNext({
        ...subjectData,
        ...details
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
      >
        <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">
          Detail Ukuran Badan
        </h2>

        {/* Preview foto */}
        <div className="mb-6">
          <img 
            src={subjectData.subjectPhoto} 
            alt="Subject" 
            className="w-40 h-52 object-cover rounded-xl mx-auto border-4 border-purple-200"
          />
        </div>

        {/* Tinggi & Berat */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-purple-800 font-semibold mb-2">
              Tinggi Badan (cm)
            </label>
            <input
              type="number"
              value={details.tinggi}
              onChange={(e) => setDetails({...details, tinggi: e.target.value})}
              placeholder="165"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
            />
          </div>
          <div>
            <label className="block text-purple-800 font-semibold mb-2">
              Berat Badan (kg)
            </label>
            <input
              type="number"
              value={details.berat}
              onChange={(e) => setDetails({...details, berat: e.target.value})}
              placeholder="55"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Body Type */}
        <div className="mb-6">
          <label className="block text-purple-800 font-semibold mb-3">
            Tipe Badan
          </label>
          <div className="grid grid-cols-5 gap-3">
            {bodyTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setDetails({...details, bodyType: type.value})}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  details.bodyType === type.value
                    ? 'border-purple-600 bg-purple-50 shadow-lg'
                    : 'border-purple-200 hover:border-purple-400'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-xs font-semibold text-purple-800">
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div className="mb-8">
          <label className="block text-purple-800 font-semibold mb-3">
            Rentang Usia
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: 'teen', label: 'Remaja (13-19)' },
              { value: 'young_adult', label: 'Dewasa Muda (20-30)' },
              { value: 'adult', label: 'Dewasa (31-45)' },
              { value: 'mature', label: 'Mature (46+)' }
            ].map((age) => (
              <button
                key={age.value}
                onClick={() => setDetails({...details, ageRange: age.value})}
                className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                  details.ageRange === age.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-purple-200 hover:border-purple-400'
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
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
            onClick={handleNext}
            disabled={!details.tinggi || !details.berat}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Lanjutkan
          </button>
        </div>
      </motion.div>
    </div>
  );
}
