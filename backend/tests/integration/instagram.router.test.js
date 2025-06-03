const express = require('express');
const request = require('supertest');
const instagramRouter = require('../../src/routes/instagram');
const InstagramProfile = require('../../models/InstagramProfile');

// Mock modelu InstagramProfile
jest.mock('../../models/InstagramProfile', () => ({
    findOneAndUpdate: jest.fn()
}));

// Mock puppeteer
jest.mock('puppeteer', () => ({
    launch: jest.fn()
}));

describe('Instagram Router Integration Tests', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use('/instagram', instagramRouter);
        
        // Reset mocków
        jest.clearAllMocks();
    });

    test('zwraca błąd 404 dla nieistniejącego profilu', async () => {
        // Mock puppeteer dla nieistniejącego profilu
        const mockBrowser = {
            newPage: jest.fn().mockResolvedValue({
                setUserAgent: jest.fn(),
                evaluateOnNewDocument: jest.fn(),
                setViewport: jest.fn(),
                goto: jest.fn().mockResolvedValue({ ok: () => true }),
                url: jest.fn().mockReturnValue('https://www.instagram.com/nonexistent/'),
                content: jest.fn().mockResolvedValue('Sorry, this page isn\'t available'),
                evaluate: jest.fn(),
                close: jest.fn()
            }),
            close: jest.fn()
        };

        require('puppeteer').launch.mockResolvedValue(mockBrowser);

        const response = await request(app)
            .get('/instagram/nonexistent')
            .expect(404);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Profil nie istnieje');
    });

    test('obsługuje błędy timeout', async () => {
        const mockBrowser = {
            newPage: jest.fn().mockResolvedValue({
                setUserAgent: jest.fn(),
                evaluateOnNewDocument: jest.fn(),
                setViewport: jest.fn(),
                goto: jest.fn().mockRejectedValue(new Error('Navigation timeout')),
                close: jest.fn()
            }),
            close: jest.fn()
        };

        require('puppeteer').launch.mockResolvedValue(mockBrowser);

        const response = await request(app)
            .get('/instagram/testuser')
            .expect(408);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Przekroczono limit czasu');
    });

    test('obsługuje błędy wykrycia bota', async () => {
        const mockBrowser = {
            newPage: jest.fn().mockResolvedValue({
                setUserAgent: jest.fn(),
                evaluateOnNewDocument: jest.fn(),
                setViewport: jest.fn(),
                goto: jest.fn().mockRejectedValue(new Error('Instagram wykrył bota')),
                close: jest.fn()
            }),
            close: jest.fn()
        };

        require('puppeteer').launch.mockResolvedValue(mockBrowser);

        const response = await request(app)
            .get('/instagram/testuser')
            .expect(403);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('wykrył automatyczne pobieranie');
    });

    test('zwraca dane profilu dla istniejącego użytkownika', async () => {
        const mockBrowser = {
            newPage: jest.fn().mockResolvedValue({
                setUserAgent: jest.fn(),
                evaluateOnNewDocument: jest.fn(),
                setViewport: jest.fn(),
                goto: jest.fn().mockResolvedValue({ ok: () => true }),
                url: jest.fn().mockReturnValue('https://www.instagram.com/testuser/'),
                content: jest.fn().mockResolvedValue('<html>valid content</html>'),
                evaluate: jest.fn().mockResolvedValue({
                    description: '1K Followers, 500 Following, 100 Posts - Test User (@testuser) on Instagram: "Test bio"'
                }),
                close: jest.fn()
            }),
            close: jest.fn()
        };

        require('puppeteer').launch.mockResolvedValue(mockBrowser);
        InstagramProfile.findOneAndUpdate.mockResolvedValue({
            username: 'testuser',
            followers: 1000,
            following: 500,
            posts: 100
        });

        const response = await request(app)
            .get('/instagram/testuser')
            .expect(200);

        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('followers');
        expect(response.body).toHaveProperty('following');
        expect(response.body).toHaveProperty('posts');
    });
});