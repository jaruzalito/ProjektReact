// Funkcja calculateTrustLevel - dostosuj według twojej implementacji
function calculateTrustLevel(profile) {
    if (!profile) return 0;

    let score = 0;
    const { followers, following, posts, avgRating, reviewCount } = profile;

    // Stosunek obserwujących do obserwowanych
    const ratio = following > 0 ? followers / following : followers;
    if (ratio > 2) score += 20;
    else if (ratio > 1) score += 10;
    else if (ratio > 0.5) score += 5;

    // Liczba postów
    if (posts > 100) score += 15;
    else if (posts > 50) score += 10;
    else if (posts > 10) score += 5;

    // Liczba obserwujących
    if (followers > 10000) score += 20;
    else if (followers > 1000) score += 15;
    else if (followers > 100) score += 10;
    else if (followers > 10) score += 5;

    // Średnia ocena
    if (avgRating >= 4) score += 25;
    else if (avgRating >= 3) score += 15;
    else if (avgRating >= 2) score += 10;
    else if (avgRating >= 1) score += 5;

    // Liczba recenzji
    if (reviewCount > 50) score += 10;
    else if (reviewCount > 20) score += 8;
    else if (reviewCount > 10) score += 5;
    else if (reviewCount > 0) score += 2;

    return Math.min(score, 100);
}

describe('calculateTrustLevel', () => {
    test('zwraca 0 dla pustego profilu', () => {
        expect(calculateTrustLevel(null)).toBe(0);
        expect(calculateTrustLevel(undefined)).toBe(0);
        expect(calculateTrustLevel({})).toBe(0);
    });

    test('oblicza wysoki poziom zaufania dla dobrego profilu', () => {
        const profile = {
            followers: 50000,
            following: 1000,
            posts: 200,
            avgRating: 4.5,
            reviewCount: 100
        };

        const result = calculateTrustLevel(profile);
        expect(result).toBeGreaterThan(80);
        expect(result).toBeLessThanOrEqual(100);
    });

    test('oblicza niski poziom zaufania dla słabego profilu', () => {
        const profile = {
            followers: 10,
            following: 5000,
            posts: 2,
            avgRating: 1.5,
            reviewCount: 1
        };

        const result = calculateTrustLevel(profile);
        expect(result).toBeLessThan(30);
    });

    test('oblicza średni poziom zaufania dla średniego profilu', () => {
        const profile = {
            followers: 1500,
            following: 800,
            posts: 75,
            avgRating: 3.2,
            reviewCount: 25
        };

        const result = calculateTrustLevel(profile);
        expect(result).toBeGreaterThan(40);
        expect(result).toBeLessThan(70);
    });

    test('nie przekracza maksymalnej wartości 100', () => {
        const profile = {
            followers: 1000000,
            following: 100,
            posts: 1000,
            avgRating: 5,
            reviewCount: 1000
        };

        const result = calculateTrustLevel(profile);
        expect(result).toBe(90);
    });

    test('obsługuje brak niektórych pól', () => {
        const profile = {
            followers: 1000,
            following: 500
        };

        const result = calculateTrustLevel(profile);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(50);
    });
});