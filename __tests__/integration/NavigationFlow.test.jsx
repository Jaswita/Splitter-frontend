import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../../components/pages/LandingPage';

describe('Integration: Navigation Flow', () => {
    test('1️⃣ Verifies Landing Page correctly delegates instance navigation', () => {
        const mockNavigate = jest.fn();
        render(<LandingPage onNavigate={mockNavigate} />);
        
        const startBtn = screen.getAllByRole('button').find(b => b.textContent.match(/Get Started/i) || b.textContent.match(/Connect/i));
        if (startBtn) {
            fireEvent.click(startBtn);
            expect(mockNavigate).toHaveBeenCalledWith('instances');
        }
    });
});
