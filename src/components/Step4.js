/**
 * パスフレーズ設定コンポーネント
 */
import { useState } from 'react';
import { validatePassphrase } from '../utils/errorHandler';

/**
 * Step4コンポーネント
 * @param {Object} props - プロパティ
 * @param {string} props.outputFormat - 選択された出力形式
 * @param {function} props.onSelect - 選択時のコールバック
 * @param {string} props.passphrase - 現在のパスフレーズ
 * @param {function} props.onBack - 戻るボタンのコールバック
 * @param {function} props.onNext - 次へボタンのコールバック
 * @param {string} props.language - 表示言語
 */
export default function Step4({
    outputFormat,
    onSelect,
    passphrase,
    onBack,
    onNext,
    language
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassphrase, setConfirmPassphrase] = useState('');
    const [error, setError] = useState('');

    // 言語に応じたテキストを取得
    const texts = {
        ja: {
            title: 'パスフレーズの設定',
            subtitle: '秘密鍵の保護に使用するパスフレーズを設定してください',
            passphraseLabel: 'パスフレーズ',
            passphrasePlaceholder: '8文字以上のパスフレーズを入力',
            confirmLabel: 'パスフレーズの確認',
            confirmPlaceholder: 'パスフレーズを再入力',
            showPassword: '表示',
            hidePassword: '非表示',
            optional: '（オプション）',
            back: '戻る',
            next: '次へ',
            errorMatch: 'パスフレーズが一致しません',
            errorLength: 'パスフレーズは8文字以上必要です',
            info: {
                title: 'パスフレーズについて',
                description: `
                    パスフレーズは秘密鍵を暗号化して保護します。
                    強力なパスフレーズを使用することで、
                    秘密鍵が漏洩した場合でも安全を確保できます。
                `,
                recommendations: [
                    '8文字以上の長さ',
                    '大文字と小文字を含める',
                    '数字を含める',
                    '記号を含める',
                    '推測しにくい文字列を使用'
                ]
            }
        },
        en: {
            title: 'Set Passphrase',
            subtitle: 'Set a passphrase to protect your private key',
            passphraseLabel: 'Passphrase',
            passphrasePlaceholder: 'Enter passphrase (8+ characters)',
            confirmLabel: 'Confirm Passphrase',
            confirmPlaceholder: 'Re-enter passphrase',
            showPassword: 'Show',
            hidePassword: 'Hide',
            optional: '(Optional)',
            back: 'Back',
            next: 'Next',
            errorMatch: 'Passphrases do not match',
            errorLength: 'Passphrase must be at least 8 characters',
            info: {
                title: 'About Passphrase',
                description: `
                    A passphrase encrypts and protects your private key.
                    Using a strong passphrase ensures security
                    even if your private key is compromised.
                `,
                recommendations: [
                    'At least 8 characters',
                    'Include uppercase and lowercase letters',
                    'Include numbers',
                    'Include symbols',
                    'Use unpredictable strings'
                ]
            }
        }
    }[language];

    // パスフレーズの検証
    const validateInput = () => {
        if (!passphrase) {
            // パスフレーズが空の場合は次のステップへ
            onNext();
            return;
        }

        if (passphrase !== confirmPassphrase) {
            setError(texts.errorMatch);
            return;
        }

        const validation = validatePassphrase({ outputFormat, passphrase });
        if (!validation.isValid) {
            setError(validation.message);
            return;
        }

        setError('');
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{texts.title}</h2>
                <p className="text-gray-600 mt-2">{texts.subtitle}</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {texts.passphraseLabel} {texts.optional}
                    </label>
                    <div className="mt-1 relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passphrase}
                            onChange={(e) => onSelect(e.target.value)}
                            onDoubleClick={() => {
                                if (!passphrase || (passphrase === confirmPassphrase && validatePassphrase({ outputFormat, passphrase }).isValid)) {
                                    onNext();
                                } else if (passphrase !== confirmPassphrase) {
                                    setError(texts.errorMatch);
                                } else {
                                    setError(texts.errorLength);
                                }
                            }}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder={texts.passphrasePlaceholder}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? texts.hidePassword : texts.showPassword}
                        </button>
                    </div>
                </div>

                {passphrase && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {texts.confirmLabel}
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassphrase}
                            onChange={(e) => setConfirmPassphrase(e.target.value)}
                            onDoubleClick={() => {
                                if (!passphrase || (passphrase === confirmPassphrase && validatePassphrase({ outputFormat, passphrase }).isValid)) {
                                    onNext();
                                } else if (passphrase !== confirmPassphrase) {
                                    setError(texts.errorMatch);
                                } else {
                                    setError(texts.errorLength);
                                }
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder={texts.confirmPlaceholder}
                        />
                    </div>
                )}
            </div>

            {/* パスフレーズの説明 */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg">{texts.info.title}</h3>
                <p className="mt-2 text-gray-600">
                    {texts.info.description}
                </p>
                <ul className="mt-4 list-disc list-inside text-gray-600">
                    {texts.info.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                >
                    {texts.back}
                </button>
                <button
                    onClick={validateInput}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    {texts.next}
                </button>
            </div>
        </div>
    );
}