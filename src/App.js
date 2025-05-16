/**
 * メインアプリケーションコンポーネント
 */
import React, { useState, useEffect } from 'react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import { createMetadata } from './utils/metadata';
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

// デバッグ用カスタムフック
const useDebugState = (name, value) => {
    useEffect(() => {
        console.log(`[Debug] ${name} updated:`, value);
    }, [name, value]);
    return value;
};

export default function App() {
    // 状態をlocalStorageから初期化
    const [step, setStep] = useState(() => {
        const saved = localStorage.getItem('step');
        return saved ? parseInt(saved) : 1;
    });
    const [keyType, setKeyType] = useState(() => localStorage.getItem('keyType') || '');
    const [keySize, setKeySize] = useState(() => localStorage.getItem('keySize') || '');
    const [outputFormat, setOutputFormat] = useState(() => localStorage.getItem('outputFormat') || '');
    const [passphrase, setPassphrase] = useState(() => localStorage.getItem('passphrase') || '');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'ja');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedKeys, setGeneratedKeys] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [debugMode, setDebugMode] = useState(true); // デバッグモードのトグル

    // 状態変更時にログとlocalStorageに保存
    useDebugState('step', step);
    useDebugState('keyType', keyType);
    useDebugState('keySize', keySize);
    useDebugState('outputFormat', outputFormat);
    useDebugState('passphrase', passphrase);
    useDebugState('language', language);
    useDebugState('isGenerating', isGenerating);
    useDebugState('showResults', showResults);

    useEffect(() => {
        localStorage.setItem('step', step.toString());
    }, [step]);
    useEffect(() => {
        localStorage.setItem('keyType', keyType);
    }, [keyType]);
    useEffect(() => {
        localStorage.setItem('keySize', keySize);
    }, [keySize]);
    useEffect(() => {
        localStorage.setItem('outputFormat', outputFormat);
    }, [outputFormat]);
    useEffect(() => {
        localStorage.setItem('passphrase', passphrase);
    }, [passphrase]);
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const handleNext = () => {
        console.log('[Debug] handleNext called, current step:', step);
        setStep(prev => {
            const newStep = Math.min(prev + 1, 5);
            console.log('[Debug] Moving to step:', newStep);
            return newStep;
        });
    };

    const handleBack = () => {
        console.log('[Debug] handleBack called, current step:', step);
        setStep(prev => {
            const newStep = Math.max(prev - 1, 1);
            console.log('[Debug] Moving to step:', newStep);
            return newStep;
        });
    };

    // 状態設定関数にログを追加
    const setKeyTypeWithLog = (value) => {
        console.log('[Debug] setKeyType called with:', value);
        setKeyType(value);
    };

    const setKeySizeWithLog = (value) => {
        console.log('[Debug] setKeySize called with:', value);
        setKeySize(value);
    };

    const setOutputFormatWithLog = (value) => {
        console.log('[Debug] setOutputFormat called with:', value);
        setOutputFormat(value);
    };

    const setPassphraseWithLog = (value) => {
        console.log('[Debug] setPassphrase called with:', value);
        setPassphrase(value);
    };

    // 鍵生成処理
    const handleGenerate = async () => {
        console.log('[Debug] handleGenerate called with params:', { keyType, keySize, outputFormat, passphrase });
        console.log('[Debug] keySize type:', typeof keySize, 'value:', keySize);
        setIsGenerating(true);
        try {
            const params = { keyType, keySize, outputFormat, passphrase };
            const validation = validateAll(params);
            console.log('[Debug] Validation result:', validation);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            let keyPair;
            console.log('[Debug] Generating key pair for keyType:', keyType);
            switch (keyType) {
                case 'rsa':
                    keyPair = await generateRSAKeyPair(Number(keySize));
                    break;
                case 'ecdsa':
                    keyPair = await generateECDSAKeyPair(Number(keySize));
                    break;
                case 'eddsa':
                    keyPair = await generateEdDSAKeyPair(Number(keySize));
                    break;
                default:
                    throw new Error('Invalid key type');
            }
            console.log('[Debug] Generated key pair:', keyPair);

            let publicKey, privateKey;
            console.log('[Debug] Converting to output format:', outputFormat);
            switch (outputFormat) {
                case 'pem':
                    publicKey = convertToPEM(keyPair.publicKey, 'public');
                    privateKey = convertToPEM(keyPair.privateKey, 'private', passphrase);
                    break;
                case 'jwk':
                    publicKey = convertToJWK(keyPair.publicKey);
                    privateKey = convertToJWK(keyPair.privateKey);
                    break;
                case 'ssh':
                    publicKey = convertToSSH(keyPair.publicKey);
                    privateKey = convertToSSH(keyPair.privateKey);
                    break;
                case 'pgp':
                    publicKey = await convertToOpenPGP(keyPair.publicKey, 'public');
                    privateKey = await convertToOpenPGP(keyPair.privateKey, 'private', passphrase);
                    break;
                default:
                    throw new Error('Invalid output format');
            }
            console.log('[Debug] Converted keys:', { publicKey, privateKey });

            const metadata = createMetadata({
                keyType,
                keySize,
                outputFormat,
                passphrase: !!passphrase,
                generatedAt: new Date().toISOString()
            });
            console.log('[Debug] Generated metadata:', metadata);

            setGeneratedKeys({
                publicKey,
                privateKey,
                metadata
            });
            setShowResults(true);
        } catch (err) {
            console.error('[Debug] Key generation failed:', err);
            setGeneratedKeys(null);
            setShowResults(false);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadFile = (content, fileName) => {
        console.log('[Debug] Downloading file:', fileName);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadAll = () => {
        if (!generatedKeys) return;
        console.log('[Debug] Downloading all files');
        const { publicKey, privateKey, metadata } = generatedKeys;
        downloadFile(publicKey, `public_${keyType}_${keySize}.${outputFormat}`);
        downloadFile(privateKey, `private_${keyType}_${keySize}.${outputFormat}`);
        downloadFile(JSON.stringify(metadata, null, 2), `metadata_${keyType}_${keySize}.json`);
    };

    const renderStep = () => {
        console.log('[Debug] Rendering step:', step);
        console.log('[Debug] Current params:', { keyType, keySize, outputFormat, passphrase });

        switch (step) {
            case 1:
                return (
                    <Step1
                        selected={keyType}
                        onSelect={setKeyTypeWithLog}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 2:
                return (
                    <Step2
                        keyType={keyType}
                        selected={keySize}
                        onSelect={setKeySizeWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 3:
                return (
                    <Step3
                        keyType={keyType}
                        keySize={keySize}
                        selected={outputFormat}
                        onSelect={setOutputFormatWithLog}
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
                        onSelect={setPassphraseWithLog}
                        onBack={handleBack}
                        onNext={handleNext}
                        language={language}
                    />
                );
            case 5:
                return (
                    <Step5
                        params={{ keyType, keySize, outputFormat, passphrase }}
                        onGenerate={handleGenerate}
                        onBack={handleBack}
                        isGenerating={isGenerating}
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
                {/* デバッグパネル */}
                {debugMode && (
                    <div className="bg-gray-100 p-4 mb-4 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-2">[Debug Panel]</h3>
                        <button
                            onClick={() => setDebugMode(false)}
                            className="mb-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Hide Debug Panel
                        </button>
                        <p><strong>Step:</strong> {step}</p>
                        <p><strong>KeyType:</strong> {keyType || 'Not selected'}</p>
                        <p><strong>KeySize:</strong> {keySize || 'Not selected'}</p>
                        <p><strong>OutputFormat:</strong> {outputFormat || 'Not selected'}</p>
                        <p><strong>Passphrase:</strong> {passphrase ? 'Set' : 'Not set'}</p>
                        <p><strong>Language:</strong> {language}</p>
                        <button
                            onClick={() => {
                                setStep(1);
                                setKeyType('');
                                setKeySize('');
                                setOutputFormat('');
                                setPassphrase('');
                                console.log('[Debug] State reset');
                            }}
                            className="mt-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                            Reset State
                        </button>
                    </div>
                )}
                {!debugMode && (
                    <button
                        onClick={() => setDebugMode(true)}
                        className="mb-4 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Show Debug Panel
                    </button>
                )}

                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        {renderStep()}
                    </div>
                </div>

                {/* 結果表示モーダル */}
                {showResults && generatedKeys && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold">
                                    {language === 'ja' ? '生成結果' : 'Generated Keys'}
                                </h3>
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <h4 className="font-bold">{language === 'ja' ? '公開鍵' : 'Public Key'}</h4>
                                    <textarea
                                        className="mt-1 w-full h-32 p-2 border rounded"
                                        value={generatedKeys.publicKey}
                                        readOnly
                                    />
                                    <button
                                        onClick={() => downloadFile(generatedKeys.publicKey, `public_${keyType}_${keySize}.${outputFormat}`)}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        {language === 'ja' ? 'ダウンロード' : 'Download'}
                                    </button>
                                </div>

                                <div>
                                    <h4 className="font-bold">{language === 'ja' ? '秘密鍵' : 'Private Key'}</h4>
                                    <textarea
                                        className="mt-1 w-full h-32 p-2 border rounded"
                                        value={generatedKeys.privateKey}
                                        readOnly
                                    />
                                    <button
                                        onClick={() => downloadFile(generatedKeys.privateKey, `private_${keyType}_${keySize}.${outputFormat}`)}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        {language === 'ja' ? 'ダウンロード' : 'Download'}
                                    </button>
                                </div>

                                <div>
                                    <h4 className="font-bold">{language === 'ja' ? 'メタデータ' : 'Metadata'}</h4>
                                    <textarea
                                        className="mt-1 w-full h-32 p-2 border rounded"
                                        value={JSON.stringify(generatedKeys.metadata, null, 2)}
                                        readOnly
                                    />
                                    <button
                                        onClick={() => downloadFile(JSON.stringify(generatedKeys.metadata, null, 2), `metadata_${keyType}_${keySize}.json`)}
                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        {language === 'ja' ? 'ダウンロード' : 'Download'}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <button
                                    onClick={downloadAll}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {language === 'ja' ? '一括ダウンロード' : 'Download All'}
                                </button>
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                    {language === 'ja' ? '閉じる' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}