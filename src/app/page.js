'use client';

import { useState, useEffect } from 'react';
import IdleScreen from '@/components/IdleScreen';
import Camera from '@/components/Camera';
import KainSelector from '@/components/KainSelector';
import ModelSelector from '@/components/ModelSelector';
import LoadingAnimation from '@/components/LoadingAnimation';
import ResultDisplay from '@/components/ResultDisplay';
import { analyzeSubject, generateTryOn } from '@/lib/api';

export default function KioskApp() {
  const [step, setStep] = useState('idle'); // idle, camera, analyzing, kain, model, generating, result
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [selectedKain, setSelectedKain] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('processing');
  const [error, setError] = useState(null);

  // Auto-reset ke idle jika tidak ada aktivitas
  useEffect(() => {
    if (step === 'idle') return;

    const timeout = setTimeout(() => {
      handleRestart();
    }, parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || 300000));

    return () => clearTimeout(timeout);
  }, [step]);

  const handleStart = () => {
    setStep('camera');
  };

  const handleCapture = async (photoBase64) => {
    setCapturedPhoto(photoBase64);
    setStep('analyzing');
    setLoadingProgress(0);
    setLoadingStage('analyzing');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const analysis = await analyzeSubject(photoBase64);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setAiAnalysis(analysis);
      setStep('kain');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Gagal menganalisa foto. Silakan coba lagi.');
      setTimeout(() => {
        setError(null);
        setStep('camera');
      }, 3000);
    }
  };

  const handleKainSelect = (kain) => {
    setSelectedKain(kain);
    setStep('model');
  };

  const handleModelSelect = async (model) => {
    setSelectedModel(model);
    setStep('generating');
    setLoadingProgress(0);
    setLoadingStage('uploading');

    try {
      // Simulate progress stages
      const stages = ['uploading', 'processing', 'generating', 'finalizing'];
      let currentStageIndex = 0;

      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + 5;
          
          // Update stage based on progress
          if (newProgress >= 25 && currentStageIndex === 0) {
            currentStageIndex = 1;
            setLoadingStage(stages[1]);
          } else if (newProgress >= 50 && currentStageIndex === 1) {
            currentStageIndex = 2;
            setLoadingStage(stages[2]);
          } else if (newProgress >= 75 && currentStageIndex === 2) {
            currentStageIndex = 3;
            setLoadingStage(stages[3]);
          }
          
          return Math.min(newProgress, 95);
        });
      }, 500);

      const result = await generateTryOn(
        capturedPhoto,
        selectedKain.id,
        model.id,
        null // Phone number optional, bisa diisi di result screen
      );

      clearInterval(progressInterval);
      setLoadingProgress(100);

      setResultData(result);
      setStep('result');
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Gagal membuat virtual try-on. Silakan coba lagi.');
      setTimeout(() => {
        setError(null);
        setStep('model');
      }, 3000);
    }
  };

  const handleRestart = () => {
    // Reset all state
    setStep('idle');
    setCapturedPhoto(null);
    setAiAnalysis(null);
    setSelectedKain(null);
    setSelectedModel(null);
    setResultData(null);
    setLoadingProgress(0);
    setLoadingStage('processing');
    setError(null);
  };

  // Error overlay
  if (error) {
    return (
      <div className="fixed inset-0 bg-red-500 flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-3xl font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {step === 'idle' && <IdleScreen onStart={handleStart} />}
      
      {step === 'camera' && (
        <Camera 
          onCapture={handleCapture} 
          onBack={handleRestart}
        />
      )}

      {step === 'analyzing' && (
        <LoadingAnimation 
          progress={loadingProgress}
          stage={loadingStage}
        />
      )}

      {step === 'kain' && (
        <KainSelector
          onSelect={handleKainSelect}
          onBack={() => setStep('camera')}
          recommendations={aiAnalysis?.recommended_models?.map(r => r.id) || []}
        />
      )}

      {step === 'model' && (
        <ModelSelector
          onSelect={handleModelSelect}
          onBack={() => setStep('kain')}
          selectedKain={selectedKain}
          aiRecommendations={aiAnalysis?.recommended_models || []}
        />
      )}

      {step === 'generating' && (
        <LoadingAnimation 
          progress={loadingProgress}
          stage={loadingStage}
        />
      )}

      {step === 'result' && (
        <ResultDisplay
          resultData={resultData}
          selectedKain={selectedKain}
          selectedModel={selectedModel}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
