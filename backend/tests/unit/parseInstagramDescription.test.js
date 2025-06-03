function parseNumberWithSuffix(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[,\s]/g, '').toUpperCase();
    const match = cleaned.match(/^(\d+(?:\.\d+)?)([KMBTQ]?)$/);
    if (!match) return parseInt(cleaned, 10) || 0;
    const number = parseFloat(match[1]);
    const suffix = match[2];
    const multipliers = { 'K': 1000, 'M': 1000000, 'B': 1000000000, 'T': 1000000000000, 'Q': 1000000000000000 };
    return Math.floor(number * (multipliers[suffix] || 1));
}

function parseInstagramDescription(description, requestedUsername, pageTitle) {
    if (!description) return null;

    const fullRegex = /(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?\s*-\s*(.*?)\s*\(@([\w.]+)\)\s*on\s*Instagram:\s*"([\s\S]*?)"$/i;
    
    const fullMatch = description.match(fullRegex);

    if (fullMatch) {
        const followers = parseNumberWithSuffix(fullMatch[1]);
        const following = parseNumberWithSuffix(fullMatch[2]);
        const posts = parseNumberWithSuffix(fullMatch[3]);
        const fullName = fullMatch[4] ? fullMatch[4].trim() : null;
        const username = fullMatch[5] ? fullMatch[5].trim() : requestedUsername;
        const bio = fullMatch[6] ? fullMatch[6].trim().replace(/\s+/g, ' ') : '';

        return {
            followers,
            following,
            posts,
            fullName: fullName || username,
            username,
            bio: bio || 'Brak opisu'
        };
    }

    const basicRegex = /(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following,\s*(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?/i;
    const basicMatch = description.match(basicRegex);

    if (basicMatch) {
        return {
            followers: parseNumberWithSuffix(basicMatch[1]),
            following: parseNumberWithSuffix(basicMatch[2]),
            posts: parseNumberWithSuffix(basicMatch[3]),
            fullName: requestedUsername, 
            username: requestedUsername,
            bio: 'Brak opisu'
        };
    }
    
    const followersMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Followers?/i);
    const followingMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Following/i);
    const postsMatch = description.match(/(\d+(?:[.,]\d+)?[KMBTQ]?|[\d,]+)\s+Posts?/i);
    
    if (followersMatch && followingMatch && postsMatch) {
        return {
            followers: parseNumberWithSuffix(followersMatch[1]),
            following: parseNumberWithSuffix(followingMatch[1]),
            posts: parseNumberWithSuffix(postsMatch[1]),
            fullName: requestedUsername,
            username: requestedUsername,
            bio: 'Brak opisu'
        };
    }

    return null;
}

describe('parseInstagramDescription', () => {
    test('zwraca null dla pustego opisu', () => {
        expect(parseInstagramDescription('', 'testuser')).toBeNull();
        expect(parseInstagramDescription(null, 'testuser')).toBeNull();
        expect(parseInstagramDescription(undefined, 'testuser')).toBeNull();
    });

    test('parsuje pełny format opisu Instagram', () => {
        const description = '1.2K Followers, 500 Following, 100 Posts - John Doe (@johndoe) on Instagram: "Love photography and travel"';
        const result = parseInstagramDescription(description, 'johndoe');
        
        expect(result).toEqual({
            followers: 1200,
            following: 500,
            posts: 100,
            fullName: 'John Doe',
            username: 'johndoe',
            bio: 'Love photography and travel'
        });
    });

    test('parsuje format bez bio', () => {
        const description = '500 Followers, 200 Following, 50 Posts - John Doe (@johndoe) on Instagram: ""';
        const result = parseInstagramDescription(description, 'johndoe');
        
        expect(result).toEqual({
            followers: 500,
            following: 200,
            posts: 50,
            fullName: 'John Doe',
            username: 'johndoe',
            bio: 'Brak opisu'
        });
    });

    test('parsuje podstawowy format bez nazwy użytkownika', () => {
        const description = '500 Followers, 200 Following, 50 Posts';
        const result = parseInstagramDescription(description, 'testuser');
        
        expect(result).toEqual({
            followers: 500,
            following: 200,
            posts: 50,
            fullName: 'testuser',
            username: 'testuser',
            bio: 'Brak opisu'
        });
    });

    test('obsługuje duże liczby z przyrostkami', () => {
        const description = '1.5M Followers, 300 Following, 2.5K Posts - Celebrity (@celebrity) on Instagram: "Famous person"';
        const result = parseInstagramDescription(description, 'celebrity');
        
        expect(result).toEqual({
            followers: 1500000,
            following: 300,
            posts: 2500,
            fullName: 'Celebrity',
            username: 'celebrity',
            bio: 'Famous person'
        });
    });

    test('zwraca null gdy nie można sparsować', () => {
        const description = 'To jest tylko tekst bez liczb followers';
        const result = parseInstagramDescription(description, 'testuser');
        
        expect(result).toBeNull();
    });
});