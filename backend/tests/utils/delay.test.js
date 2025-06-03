async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('delay function', () => {
    test('opóźnia wykonanie o określony czas', async () => {
        const start = Date.now();
        await delay(100);
        const end = Date.now();
        
        expect(end - start).toBeGreaterThanOrEqual(100);
        expect(end - start).toBeLessThan(150);
    });

    test('działa z różnymi wartościami', async () => {
        const start = Date.now();
        await delay(50);
        const end = Date.now();
        
        expect(end - start).toBeGreaterThanOrEqual(50);
        expect(end - start).toBeLessThan(100);
    });

    test('działa z zerem', async () => {
        const start = Date.now();
        await delay(0);
        const end = Date.now();
        
        expect(end - start).toBeLessThan(50); 
    });

    test('zwraca Promise', () => {
        const result = delay(10);
        expect(result).toBeInstanceOf(Promise);
    });

    test('działa z ujemnymi wartościami', async () => {
        const start = Date.now();
        await delay(-100); 
        const end = Date.now();
        
        expect(end - start).toBeLessThan(50);
    });
});