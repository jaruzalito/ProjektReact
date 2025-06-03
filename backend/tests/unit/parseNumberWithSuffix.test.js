// Tymczasowo definiujemy funkcję tutaj do testowania
function parseNumberWithSuffix(str) {
    if (!str) return 0;

    const cleaned = str.replace(/[,\s]/g, '').toUpperCase();
    const match = cleaned.match(/^(\d+(?:\.\d+)?)([KMBTQ]?)$/);
    
    if (!match) return parseInt(cleaned, 10) || 0;

    const number = parseFloat(match[1]);
    const suffix = match[2];

    const multipliers = {
        'K': 1000,
        'M': 1000000,
        'B': 1000000000,
        'T': 1000000000000,
        'Q': 1000000000000000
    };

    return Math.floor(number * (multipliers[suffix] || 1));
}

describe('parseNumberWithSuffix', () => {
    test('parsuje liczby bez przyrostka', () => {
        expect(parseNumberWithSuffix('1000')).toBe(1000);
        expect(parseNumberWithSuffix('500')).toBe(500);
        expect(parseNumberWithSuffix('0')).toBe(0);
    });

    test('parsuje liczby z przyrostkiem K', () => {
        expect(parseNumberWithSuffix('1K')).toBe(1000);
        expect(parseNumberWithSuffix('1.5K')).toBe(1500);
        expect(parseNumberWithSuffix('10K')).toBe(10000);
        expect(parseNumberWithSuffix('999K')).toBe(999000);
    });

    test('parsuje liczby z przyrostkiem M', () => {
        expect(parseNumberWithSuffix('1M')).toBe(1000000);
        expect(parseNumberWithSuffix('2.5M')).toBe(2500000);
        expect(parseNumberWithSuffix('10M')).toBe(10000000);
    });

    test('parsuje liczby z przyrostkiem B, T, Q', () => {
        expect(parseNumberWithSuffix('1B')).toBe(1000000000);
        expect(parseNumberWithSuffix('1T')).toBe(1000000000000);
        expect(parseNumberWithSuffix('1Q')).toBe(1000000000000000);
    });

    test('obsługuje puste lub nieprawidłowe dane', () => {
        expect(parseNumberWithSuffix('')).toBe(0);
        expect(parseNumberWithSuffix(null)).toBe(0);
        expect(parseNumberWithSuffix(undefined)).toBe(0);
        expect(parseNumberWithSuffix('nieprawidłowe')).toBe(0);
        expect(parseNumberWithSuffix('abc123')).toBe(0);
    });

    test('obsługuje liczby z przecinkami i spacjami', () => {
        expect(parseNumberWithSuffix('1,000')).toBe(1000);
        expect(parseNumberWithSuffix('1 000')).toBe(1000);
        expect(parseNumberWithSuffix('2.5 K')).toBe(2500);
        expect(parseNumberWithSuffix('1,500K')).toBe(1500000);
    });

    test('obsługuje małe i wielkie litery przyrostków', () => {
        expect(parseNumberWithSuffix('1k')).toBe(1000);
        expect(parseNumberWithSuffix('1m')).toBe(1000000);
        expect(parseNumberWithSuffix('1b')).toBe(1000000000);
    });
});