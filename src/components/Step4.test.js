import { render, screen, fireEvent } from '@testing-library/react';
import Step4 from './Step4';

describe('Step4コンポーネントテスト', () => {
    const mockOnSelect = jest.fn();
    const mockOnBack = jest.fn();
    const mockOnNext = jest.fn();

    beforeEach(() => {
        mockOnSelect.mockClear();
        mockOnBack.mockClear();
        mockOnNext.mockClear();
    });

    test('コンポーネントの初期表示', () => {
        render(
            <Step4
                outputFormat="PEM"
                passphrase=""
                onSelect={mockOnSelect}
                onBack={mockOnBack}
                onNext={mockOnNext}
                language="ja"
            />
        );

        // タイトルの確認
        expect(screen.getByText('パスフレーズの設定')).toBeInTheDocument();

        // 入力フィールドの確認
        expect(screen.getByPlaceholderText('8文字以上のパスフレーズを入力')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('パスフレーズを再入力')).toBeInTheDocument();

        // ボタンの確認
        expect(screen.getByText('戻る')).toBeInTheDocument();
        expect(screen.getByText('次へ')).toBeInTheDocument();
    });

    test('パスフレーズのバリデーション', () => {
        render(
            <Step4
                outputFormat="PEM"
                passphrase="short"
                onSelect={mockOnSelect}
                onBack={mockOnBack}
                onNext={mockOnNext}
                language="ja"
            />
        );

        // パスフレーズが一致しないエラー
        expect(screen.getByText('パスフレーズが一致しません')).toBeInTheDocument();

        // パスフレーズの入力
        const passphraseInput = screen.getByPlaceholderText('8文字以上のパスフレーズを入力');
        const confirmInput = screen.getByPlaceholderText('パスフレーズを再入力');

        fireEvent.change(passphraseInput, { target: { value: 'strongPassword123!' } });
        fireEvent.change(confirmInput, { target: { value: 'strongPassword123!' } });

        // エラーメッセージが消えることを確認
        expect(screen.queryByText('パスフレーズが一致しません')).not.toBeInTheDocument();
    });

    test('パスフレーズの表示切り替え', () => {
        render(
            <Step4
                outputFormat="PEM"
                passphrase=""
                onSelect={mockOnSelect}
                onBack={mockOnBack}
                onNext={mockOnNext}
                language="ja"
            />
        );

        // パスフレーズ入力フィールドの初期状態を確認
        const passphraseInput = screen.getByPlaceholderText('8文字以上のパスフレーズを入力');
        expect(passphraseInput).toHaveAttribute('type', 'password');

        // 表示ボタンをクリック
        fireEvent.click(screen.getByText('表示'));

        // パスフレーズが表示されることを確認
        expect(passphraseInput).toHaveAttribute('type', 'text');
    });

    test('ナビゲーションボタンの制御', () => {
        render(
            <Step4
                outputFormat="PEM"
                passphrase=""
                onSelect={mockOnSelect}
                onBack={mockOnBack}
                onNext={mockOnNext}
                language="ja"
            />
        );

        // 戻るボタンのクリック
        fireEvent.click(screen.getByText('戻る'));
        expect(mockOnBack).toHaveBeenCalled();

        // 次へボタンのクリック
        fireEvent.click(screen.getByText('次へ'));
        expect(mockOnNext).toHaveBeenCalled();
    });

    test('アクセシビリティ対応', () => {
        render(
            <Step4
                outputFormat="PEM"
                passphrase=""
                onSelect={mockOnSelect}
                onBack={mockOnBack}
                onNext={mockOnNext}
                language="ja"
            />
        );

        // 入力フィールドのラベルを確認
        const passphraseInput = screen.getByPlaceholderText('8文字以上のパスフレーズを入力');
        const confirmInput = screen.getByPlaceholderText('パスフレーズを再入力');

        expect(passphraseInput).toHaveAccessibleName('パスフレーズ （オプション）');
        expect(confirmInput).toHaveAccessibleName('パスフレーズの確認');
    });
}); 