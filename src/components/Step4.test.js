import { render, screen, fireEvent } from '@testing-library/react';
import Step4 from './Step4';

describe('Step4コンポーネントテスト', () => {
    const mockOnNext = jest.fn();
    const mockOnPrev = jest.fn();
    const mockOnPassphraseChange = jest.fn();
    const mockOnConfirmPassphraseChange = jest.fn();

    beforeEach(() => {
        mockOnNext.mockClear();
        mockOnPrev.mockClear();
        mockOnPassphraseChange.mockClear();
        mockOnConfirmPassphraseChange.mockClear();
    });

    test('コンポーネントの初期表示', () => {
        render(
            <Step4
                passphrase=""
                confirmPassphrase=""
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // タイトルの確認
        expect(screen.getByText('パスフレーズの設定')).toBeInTheDocument();

        // 入力フィールドの確認
        expect(screen.getByLabelText('パスフレーズ')).toBeInTheDocument();
        expect(screen.getByLabelText('パスフレーズの確認')).toBeInTheDocument();
    });

    test('パスフレーズの入力', () => {
        render(
            <Step4
                passphrase=""
                confirmPassphrase=""
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // パスフレーズの入力
        const passphraseInput = screen.getByLabelText('パスフレーズ');
        fireEvent.change(passphraseInput, { target: { value: 'test-passphrase' } });
        expect(mockOnPassphraseChange).toHaveBeenCalledWith('test-passphrase');

        // 確認用パスフレーズの入力
        const confirmInput = screen.getByLabelText('パスフレーズの確認');
        fireEvent.change(confirmInput, { target: { value: 'test-passphrase' } });
        expect(mockOnConfirmPassphraseChange).toHaveBeenCalledWith('test-passphrase');
    });

    test('パスフレーズの表示/非表示切り替え', () => {
        render(
            <Step4
                passphrase="test-passphrase"
                confirmPassphrase="test-passphrase"
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // パスフレーズ入力フィールドの表示/非表示
        const passphraseInput = screen.getByLabelText('パスフレーズ');
        expect(passphraseInput).toHaveAttribute('type', 'password');

        const toggleButton = screen.getByText('表示');
        fireEvent.click(toggleButton);
        expect(passphraseInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passphraseInput).toHaveAttribute('type', 'password');
    });

    test('パスフレーズの強度表示', () => {
        render(
            <Step4
                passphrase="test-passphrase"
                confirmPassphrase="test-passphrase"
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // パスフレーズ強度の表示確認
        expect(screen.getByText(/パスフレーズの強度/)).toBeInTheDocument();
        expect(screen.getByTestId('strength-meter')).toBeInTheDocument();
    });

    test('パスフレーズのバリデーション', () => {
        render(
            <Step4
                passphrase="short"
                confirmPassphrase="different"
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // 短すぎるパスフレーズのエラー
        expect(screen.getByText(/パスフレーズは8文字以上/)).toBeInTheDocument();

        // パスフレーズ不一致のエラー
        expect(screen.getByText(/パスフレーズが一致しません/)).toBeInTheDocument();
    });

    test('ナビゲーションボタンの制御', () => {
        render(
            <Step4
                passphrase=""
                confirmPassphrase=""
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // 戻るボタンの確認
        const prevButton = screen.getByText('戻る');
        expect(prevButton).toBeEnabled();
        fireEvent.click(prevButton);
        expect(mockOnPrev).toHaveBeenCalled();

        // 初期状態では次へボタンは無効
        const nextButton = screen.getByText('次へ');
        expect(nextButton).toBeDisabled();

        // 有効なパスフレーズを入力すると次へボタンが有効になる
        const passphraseInput = screen.getByLabelText('パスフレーズ');
        const confirmInput = screen.getByLabelText('パスフレーズの確認');

        fireEvent.change(passphraseInput, { target: { value: 'test-passphrase' } });
        fireEvent.change(confirmInput, { target: { value: 'test-passphrase' } });
        expect(nextButton).toBeEnabled();

        // 次へボタンをクリック
        fireEvent.click(nextButton);
        expect(mockOnNext).toHaveBeenCalled();
    });

    test('パスフレーズなしでの進行', () => {
        render(
            <Step4
                passphrase=""
                confirmPassphrase=""
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // パスフレーズなしで進むボタンの確認
        const skipButton = screen.getByText('パスフレーズなしで進む');
        expect(skipButton).toBeEnabled();

        fireEvent.click(skipButton);
        expect(mockOnNext).toHaveBeenCalled();
    });

    test('アクセシビリティ対応', () => {
        render(
            <Step4
                passphrase=""
                confirmPassphrase=""
                onPassphraseChange={mockOnPassphraseChange}
                onConfirmPassphraseChange={mockOnConfirmPassphraseChange}
                onNext={mockOnNext}
                onPrev={mockOnPrev}
            />
        );

        // キーボード操作
        const passphraseInput = screen.getByLabelText('パスフレーズ');
        passphraseInput.focus();
        fireEvent.keyPress(passphraseInput, { key: 'Enter', code: 'Enter' });

        // ARIAラベルの確認
        expect(screen.getByRole('textbox', { name: 'パスフレーズ' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'パスフレーズの確認' })).toBeInTheDocument();
    });
}); 