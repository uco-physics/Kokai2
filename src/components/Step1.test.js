import { render, screen, fireEvent } from '@testing-library/react';
import Step1 from './Step1';

describe('Step1コンポーネントテスト', () => {
    const mockOnSelect = jest.fn();

    beforeEach(() => {
        mockOnSelect.mockClear();
    });

    test('コンポーネントの初期表示（日本語）', () => {
        render(
            <Step1
                selected=""
                onSelect={mockOnSelect}
                language="ja"
            />
        );

        // タイトルの確認
        expect(screen.getByText('暗号方式の選択')).toBeInTheDocument();

        // 各暗号方式オプションの存在確認
        expect(screen.getByText('RSA')).toBeInTheDocument();
        expect(screen.getByText('ECDSA')).toBeInTheDocument();
        expect(screen.getByText('EdDSA')).toBeInTheDocument();

        // 説明文の存在確認
        expect(screen.getByText('用途に応じて適切な暗号方式を選択してください')).toBeInTheDocument();
    });

    test('暗号方式の選択', () => {
        render(
            <Step1
                selected=""
                onSelect={mockOnSelect}
                language="ja"
            />
        );

        // RSAを選択
        fireEvent.click(screen.getByText('RSA'));
        expect(mockOnSelect).toHaveBeenCalledWith('rsa');

        // ECDSAを選択
        fireEvent.click(screen.getByText('ECDSA'));
        expect(mockOnSelect).toHaveBeenCalledWith('ecdsa');

        // EdDSAを選択
        fireEvent.click(screen.getByText('EdDSA'));
        expect(mockOnSelect).toHaveBeenCalledWith('eddsa');
    });

    test('選択済み暗号方式の表示', () => {
        render(
            <Step1
                selected="rsa"
                onSelect={mockOnSelect}
                language="ja"
            />
        );

        // RSAが選択された状態であることを確認
        const rsaButton = screen.getByText('RSA').closest('button');
        expect(rsaButton).toHaveClass('border-blue-500');
        expect(rsaButton).toHaveClass('bg-blue-50');
    });

    test('詳細情報の表示', () => {
        render(
            <Step1
                selected=""
                onSelect={mockOnSelect}
                language="ja"
            />
        );

        // RSAの詳細情報を表示
        const detailsButtons = screen.getAllByLabelText(/詳細/);
        fireEvent.click(detailsButtons[0]);
        
        // モーダルの内容を確認
        expect(screen.getByText('RSA暗号')).toBeInTheDocument();
        expect(screen.getByText(/最も広く使われている公開鍵暗号方式です/)).toBeInTheDocument();
        
        // モーダルを閉じる
        fireEvent.click(screen.getByText('閉じる'));
        expect(screen.queryByText('RSA暗号')).not.toBeInTheDocument();
    });

    test('英語表示の確認', () => {
        render(
            <Step1
                selected=""
                onSelect={mockOnSelect}
                language="en"
            />
        );

        expect(screen.getByText('Select Cryptography Type')).toBeInTheDocument();
        expect(screen.getByText('Choose the appropriate cryptography type for your use case')).toBeInTheDocument();
    });

    test('アクセシビリティ対応', () => {
        render(
            <Step1
                selected=""
                onSelect={mockOnSelect}
                language="ja"
            />
        );

        // キーボード操作
        const rsaButton = screen.getByText('RSA').closest('button');
        rsaButton.focus();
        fireEvent.keyPress(rsaButton, { key: 'Enter', code: 'Enter' });
        expect(mockOnSelect).toHaveBeenCalledWith('rsa');

        // 詳細ボタンのARIAラベル確認
        expect(screen.getByLabelText('詳細: RSA')).toBeInTheDocument();
    });
}); 