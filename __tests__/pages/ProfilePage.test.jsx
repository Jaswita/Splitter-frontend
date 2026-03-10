import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '../../components/pages/ProfilePage';

describe('ProfilePage Stats rendering', () => {
    // Mock user data that mimics the user state 
    const mockUser = {
        username: 'alice_crypto',
        display_name: 'Alice Decent',
        followers_count: 1420,
        following_count: 12,
        posts_count: 55,
        bio: 'Decentralized web enthusiast.',
        did: 'did:key:z6Mk...'
    };

    test('1️⃣ Displays accurate user counts and profile metadata', async () => {
        render(<ProfilePage onNavigate={jest.fn()} userData={mockUser} />);
        
        // Verify names are displayed
        expect(await screen.findByText('Alice Decent')).toBeInTheDocument();
        expect(screen.getByText(/@alice_crypto/i)).toBeInTheDocument();
        
        // Verify stats
        expect(screen.getByText('1420')).toBeInTheDocument(); // Followers count
        expect(screen.getByText('12')).toBeInTheDocument();   // Following count
        expect(screen.getByText('55')).toBeInTheDocument();   // Posts count
        
        // Verify bio
        expect(screen.getByText('Decentralized web enthusiast.')).toBeInTheDocument();
    });
});
