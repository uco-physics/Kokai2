/**
 * メインアプリケーションコンポーネント
 */
import React, { useState } from 'react';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import { createMetadata } from './utils/metadata'; // 修正
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


export default function App() {
    const [step, setStep] = useState(1);
    const [keyType, setKeyType] = useState('');
    const [keySize, setKeySize] = useState('');
    const [outputFormat, setOutputFormat] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [language, setLanguage] = useState('ja');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedKeys, setGeneratedKeys] = useState(null); // 生成された鍵を保持
    const [showResults, setShowResults] = useState(false); // 結果モーダルの表示制御

    const handleNext = () => {
        setStep(prev => Math.min(prev + 1, 5));
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    // 鍵生成処理
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // パラメータをまとめる
            const params = { keyType, keySize, outputFormat, passphrase };

            // バリデーション（念のため再確認）
            const validation = validateAll(params);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

    // 鍵生成処理
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // パラメータをまとめる
            const params = { keyType, keySize, outputFormat, passphrase };

            // バリデーション（念のため再確認）
            const validation = validateAll(params);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // 鍵生成
            let keyPair;
            switch (keyType) {
                case 'rsa':
                    keyPair = await generateRSAKeyPair(keySize);
                    break;
                case 'ecdsa':
                    keyPair = await generateECDSAKeyPair(keySize);
                    break;
                case 'eddsa':
                    keyPair = await generateEdDSAKeyPair(keySize);
                    break;
                default:
                    throw new Error('Invalid key type');
            }

            // 出力形式に変換
            let publicKey, privateKey;
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

            // メタデータ生成
            const metadata = createMetadata({ // 修正
                keyType,
                keySize,
                outputFormat,
                passphrase: !!passphrase,
                generatedAt: new Date().toISOString()
            });

            // 生成結果を保存
            setGeneratedKeys({
                publicKey,
                privateKey,
                metadata
            });

            // 結果モーダルを表示
            setShowResults(true);
        } catch (err) {
            console.error('Key generation failed:', err);
            setGeneratedKeys(null);
            setShowResults(false);
        } finally {
            setIsGenerating(false);
        }
    };

    // ファイルダウンロード処理
    const downloadFile = (content, fileName) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    // 一括ダウンロード（簡易版）
    const downloadAll = () => {
        if (!generatedKeys) return;
        const { publicKey, privateKey, metadata } = generatedKeys;
        downloadFile(publicKey, `public_${keyType}_${keySize}.${outputFormat}`);
        downloadFile(privateKey, `private_${keyType}_${keySize}.${outputFormat}`);
        downloadFile(JSON.stringify(metadata, null, 2), `metadata_${keyType}_${keySize}.json`);
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
                        keyType={keyType}
                        keySize={keySize}
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




