/**
 * メインアプリケーションコンポーネント
 */
import React, { useState } from 'react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import { generateMetadata } from './utils/metadata';
import { validateAll } from './utils/errorHandler';
import {
    generateRSAKeyPair,
    generateECDSAKeyPair,
    generateEdDSAKeyPair,
    convertToPEM,
    convertToJWK,
    convertToSSH,
    convertToOpenPGP
} from './utils/crypto';

/**
 * アプリケーションコンポーネント
 */
export default function App() {
    const [step, setStep] = useState(1);
    const [keyType, setKeyType] = useState('');
    const [keySize, setKeySize] = useState('');
    const [outputFormat, setOutputFormat] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [language, setLanguage] = useState('ja');

    const handleNext = () => {
        setStep(prev => Math.min(prev + 1, 5));
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        selected={keyType}
                        onSelect={setKeyType}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 2:
                return (
                    <Step2
                        keyType={keyType}
                        selected={keySize}
                        onSelect={setKeySize}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 3:
                return (
                    <Step3
                        selected={outputFormat}
                        onSelect={setOutputFormat}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 4:
                return (
                    <Step4
                        outputFormat={outputFormat}
                        passphrase={passphrase}
                        onSelect={setPassphrase}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 5:
                return (
                    <Step5
                        keyType={keyType}
                        keySize={keySize}
                        outputFormat={outputFormat}
                        passphrase={passphrase}
                        onBack={handleBack}
                        language={language}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {renderStep()}
                    </div>
                </div>
            </div>
        </div>
    );
} 