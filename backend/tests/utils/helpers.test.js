// Funkcje pomocnicze - dostosuj według swojej implementacji
function generateWarnings(profile) {
    const warnings = [];

    if (!profile) return warnings;

    const { followers, following, posts, avgRating, reviewCount } = profile;

    // Sprawdź podejrzane proporcje
    if (following > followers * 5) {
        warnings.push('Wysoka liczba obserwowanych w stosunku do obserwujących');
    }

    if (followers > 1000 && posts < 10) {
        warnings.push('Mała liczba postów w stosunku do liczby obserwujących');
    }

    if (avgRating < 2 && reviewCount > 5) {
        warnings.push('Niska średnia ocena przy znacznej liczbie recenzji');
    }

    if (reviewCount === 0) {
        warnings.push('Brak recenzji - trudno ocenić wiarygodność');
    }

    return warnings;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Sprawdź czy nie ma podwójnych kropek
    if (email.includes('..')) return false;
    
    // Sprawdź czy nie zaczyna się ani nie kończy kropką w lokalnej części
    const localPart = email.split('@')[0];
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    
    return true;
}

function validateUsername(username) {
    if (!username || username.length < 3 || username.length > 30) {
        return false;
    }
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    return usernameRegex.test(username);
}

describe('Helper Functions', () => {
    describe('generateWarnings', () => {
        test('zwraca pustą tablicę dla null/undefined', () => {
            expect(generateWarnings(null)).toEqual([]);
            expect(generateWarnings(undefined)).toEqual([]);
        });

        test('wykrywa podejrzane proporcje obserwujących/obserwowanych', () => {
            const profile = {
                followers: 100,
                following: 600, // 6x więcej niż followers
                posts: 50
            };

            const warnings = generateWarnings(profile);
            expect(warnings).toContain('Wysoka liczba obserwowanych w stosunku do obserwujących');
        });

        test('wykrywa małą liczbę postów przy dużej liczbie obserwujących', () => {
            const profile = {
                followers: 5000,
                following: 200,
                posts: 5 // Bardzo mało postów
            };

            const warnings = generateWarnings(profile);
            expect(warnings).toContain('Mała liczba postów w stosunku do liczby obserwujących');
        });

        test('wykrywa niską średnią ocenę', () => {
            const profile = {
                followers: 1000,
                following: 500,
                posts: 50,
                avgRating: 1.5,
                reviewCount: 20
            };

            const warnings = generateWarnings(profile);
            expect(warnings).toContain('Niska średnia ocena przy znacznej liczbie recenzji');
        });

        test('wykrywa brak recenzji', () => {
            const profile = {
                followers: 1000,
                following: 500,
                posts: 50,
                reviewCount: 0
            };

            const warnings = generateWarnings(profile);
            expect(warnings).toContain('Brak recenzji - trudno ocenić wiarygodność');
        });
    });

    describe('formatNumber', () => {
        test('formatuje liczby poniżej 1000', () => {
            expect(formatNumber(0)).toBe('0');
            expect(formatNumber(500)).toBe('500');
            expect(formatNumber(999)).toBe('999');
        });

        test('formatuje liczby z przyrostkiem K', () => {
            expect(formatNumber(1000)).toBe('1.0K');
            expect(formatNumber(1500)).toBe('1.5K');
            expect(formatNumber(15000)).toBe('15.0K');
            expect(formatNumber(999000)).toBe('999.0K');
        });

        test('formatuje liczby z przyrostkiem M', () => {
            expect(formatNumber(1000000)).toBe('1.0M');
            expect(formatNumber(2500000)).toBe('2.5M');
            expect(formatNumber(15000000)).toBe('15.0M');
        });
    });

    describe('validateEmail', () => {
        test('akceptuje prawidłowe adresy email', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('test123+tag@gmail.com')).toBe(true);
        });

        test('odrzuca nieprawidłowe adresy email', () => {
            expect(validateEmail('invalid-email')).toBe(false);
            expect(validateEmail('test@')).toBe(false);
            expect(validateEmail('@domain.com')).toBe(false);
            expect(validateEmail('test..test@domain.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('validateUsername', () => {
        test('akceptuje prawidłowe nazwy użytkowników', () => {
            expect(validateUsername('testuser')).toBe(true);
            expect(validateUsername('user123')).toBe(true);
            expect(validateUsername('test.user')).toBe(true);
            expect(validateUsername('user_name')).toBe(true);
        });

        test('odrzuca nieprawidłowe nazwy użytkowników', () => {
            expect(validateUsername('ab')).toBe(false); // Za krótkie
            expect(validateUsername('a'.repeat(31))).toBe(false); // Za długie
            expect(validateUsername('user@name')).toBe(false); // Nieprawidłowy znak
            expect(validateUsername('user name')).toBe(false); // Spacja
            expect(validateUsername('')).toBe(false); // Puste
            expect(validateUsername(null)).toBe(false); // Null
        });
    });
});