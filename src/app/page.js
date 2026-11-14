'use client';

import { useState } from 'react';
import UploadSubject from '@/components/UploadSubject';
import SubjectDetails from '@/components/SubjectDetails';
import UploadGarment from '@/components/UploadGarment';
import GeneratingResult from '@/components/GeneratingResult';
import ResultDisplay from '@/components/ResultDisplay';

export default function Home() {
  const [step, setStep] = useState('upload-subject'); // upload-subject, subject-details, upload-garment, generating, result
  const [sessionData, setSessionData] = useState({});

  const handleSubjectUploaded = (data) => {
    setSessionData(data);
    setStep('subject-details');
  };

  const handleDetailsSubmitted = (data) => {
    setSessionData(data);
    setStep('upload-garment');
  };

  const handleGenerateRequest = async (data) => {
    setSessionData({...sessionData, ...data});
    setStep('generating');

    try {
      // Call API to generate
      const response = await fetch('/api/generate-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectPhoto: sessionData.subjectPhoto,
          tinggi: sessionData.tinggi,
          berat: sessionData.berat,
          bodyType: sessionData.bodyType,
          ageRange: sessionData.ageRange,
          garmentPhoto: data.garmentPhoto,
          category: data.category
        })
      });

      const result = await response.json();
      setSessionData({...sessionData, result});
      setStep('result');
    } catch (error) {
      console.error('Generate error:', error);
      // Handle error
    }
  };

  const handleReset = () => {
    setSessionData({});
    setStep('upload-subject');
  };

  return (
    <main>
      {step === 'upload-subject' && (
        <UploadSubject onNext={handleSubjectUploaded} />
      )}
      
      {step === 'subject-details' && (
        <SubjectDetails 
          subjectData={sessionData}
          onNext={handleDetailsSubmitted}
          onBack={() => setStep('upload-subject')}
        />
      )}

      {step === 'upload-garment' && (
        <UploadGarment 
          onGenerate={handleGenerateRequest}
          onBack={() => setStep('subject-details')}
        />
      )}

      {step === 'generating' && (
        <GeneratingResult />
      )}

      {step === 'result' && (
        <ResultDisplay 
          result={sessionData.result}
          onTryAgain={handleReset}
        />
      )}
    </main>
  );
}
