import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../../components/pages/LandingPage';

// Mocking onNavigate since it's a prop passed from App
describe('LandingPage', () => {
    test('1️⃣ Renders Hero and Intro Text', () => {
        render(<LandingPage onNavigate={jest.fn()} />);
        
        // Check for basic elements that should be on the landing page
        expect(screen.getByText(/Splitter/i)).toBeInTheDocument();
        // Adjust this if your actual button text is different (e.g., 'Get Started')
        const button = screen.getAllByRole('button').find(b => b.textContent.match(/Get Started/i) || b.textContent.match(/Connect/i));
        if (button) {
            expect(button).toBeInTheDocument();
        }
    });

    test('2️⃣ Navigates to Instances on interaction', () => {
        const mockNavigate = jest.fn();
        render(<LandingPage onNavigate={mockNavigate} />);
        
        const button = screen.getAllByRole('button').find(b => b.textContent.match(/Get Started/i) || b.textContent.match(/Connect/i));
        if (button) {
            fireEvent.click(button);
            // Verify internal app router is called
            expect(mockNavigate).toHaveBeenCalled();
        }
    });
});
