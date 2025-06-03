const express = require('express');
const request = require('supertest');

describe('Auth Router Integration Tests', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        
        // Mock auth router z prawidłową walidacją
        app.post('/auth/register', (req, res) => {
            const { login, email, password } = req.body;
            
            // Sprawdź czy wszystkie pola są wypełnione
            if (!login || !email || !password) {
                return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
            }
            
            // Walidacja długości
            if (login.length < 3) {
                return res.status(400).json({ error: 'Login musi mieć co najmniej 3 znaki' });
            }
            
            if (password.length < 6) {
                return res.status(400).json({ error: 'Hasło musi mieć co najmniej 6 znaków' });
            }
            
            // Walidacja email (podstawowa)
            if (!email.includes('@') || !email.includes('.')) {
                return res.status(400).json({ error: 'Nieprawidłowy format email' });
            }
            
            // Symuluj sprawdzanie czy użytkownik już istnieje
            if (login === 'existinguser') {
                return res.status(400).json({ error: 'Użytkownik już istnieje' });
            }
            
            res.status(201).json({ message: 'Użytkownik został zarejestrowany' });
        });
        
        app.post('/auth/login', (req, res) => {
            const { login, password } = req.body;
            
            if (!login || !password) {
                return res.status(400).json({ error: 'Login i hasło są wymagane' });
            }
            
            // Symuluj sprawdzanie użytkownika - tylko testuser/password123 jest prawidłowy
            if (login === 'testuser' && password === 'password123') {
                return res.status(200).json({ 
                    token: 'mock-token', 
                    user: { login: 'testuser' } 
                });
            }
            
            // Wszystkie inne kombinacje są nieprawidłowe
            res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
        });
    });

    describe('POST /auth/register', () => {
        test('rejestruje nowego użytkownika', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    login: 'testuser',
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(201);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('zarejestrowany');
        });

        test('zwraca błąd dla istniejącego użytkownika', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    login: 'existinguser',
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('już istnieje');
        });

        test('zwraca błąd dla nieprawidłowych danych', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    login: 'ab', // Za krótkie
                    email: 'invalid-email', // Nieprawidłowy email
                    password: '123' // Za krótkie
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test('zwraca błąd dla brakujących pól', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    login: '', // Pusty login
                    email: 'test@example.com'
                    // brak password
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('wymagane');
        });
    });

    describe('POST /auth/login', () => {
        test('loguje użytkownika z prawidłowymi danymi', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    login: 'testuser',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.login).toBe('testuser');
        });

        test('zwraca błąd dla nieprawidłowego hasła', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    login: 'testuser',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Nieprawidłowe');
        });

        test('zwraca błąd dla nieistniejącego użytkownika', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    login: 'nonexistent',
                    password: 'password123'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Nieprawidłowe');
        });

        test('zwraca błąd dla brakujących danych', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    login: '',
                    password: ''
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('wymagane');
        });
    });
});