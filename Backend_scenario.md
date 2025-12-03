# Scenariusze Testowe - BACKEND (Jednostkowe)

**Projekt:** InstagramChecker  
**Data:** 2025-11-26  
**Wersja:** 2.2

---

## Środowiska Testowe

| Parametr | Wartość |
|---|---|
| Urządzenie | MacBook Air (Adrian) |
| Procesor | Apple M2 |
| Pamięć RAM | 8 GB |
| Numer seryjny | NHP730D344 |
| System operacyjny | macOS Sequoia 15.6.1 |
| Node Version | 18.x |
| Port | localhost:3001 |
| Baza danych | MongoDB Local |

---

## Spis treści

1. [AUTH.ROUTER.TEST.JS](#1-authroutertestjs)
2. [INSTAGRAM.ROUTER.TEST.JS](#2-instagramroutertestjs)
3. [HELPERS.TEST.JS](#3-helperstestjs)
4. [CALCULATETRUSTLEVEL.TEST.JS](#4-calculatetrustleveltestjs)
5. [PARSENUMBERWITHSUFFIX.TEST.JS](#5-parsenumberwithsuffixtestjs)
6. [PARSEINSTAGRAMDESCRIPTION.TEST.JS](#6-parseinstagramdescriptiontestjs)
7. [DELAY.TEST.JS](#7-delaytestjs)

---

## 1. AUTH.ROUTER.TEST.JS

### Testy Rejestracji

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| AUTH-REG-001 | Rejestracja nowego użytkownika | 1. Wyślij POST /auth/register<br>2. Sprawdź status odpowiedzi<br>3. Sprawdź dane w response | login: "testuser"<br>email: "test@example.com"<br>password: "password123" | HTTP 201<br>message: "Użytkownik został zarejestrowany" | Pozytywny | - |
| AUTH-REG-002 | Rejestracja - login za krótki | 1. Wyślij POST /auth/register<br>2. Sprawdź status błędu<br>3. Sprawdź komunikat | login: "ab"<br>email: "test@example.com"<br>password: "password123" | HTTP 400<br>error: "Login musi mieć co najmniej 3 znaki" | Negatywny | KRYTYCZNY |
| AUTH-REG-003 | Rejestracja - hasło za krótkie | 1. Wyślij POST /auth/register<br>2. Sprawdź błąd | login: "testuser"<br>email: "test@example.com"<br>password: "123" | HTTP 400<br>error: "Hasło musi mieć co najmniej 6 znaków" | Negatywny | KRYTYCZNY |
| AUTH-REG-004 | Rejestracja - email nieprawidłowy | 1. Wyślij POST /auth/register<br>2. Sprawdź błąd | login: "testuser"<br>email: "invalidemail"<br>password: "password123" | HTTP 400<br>error: "Nieprawidłowy format email" | Negatywny | SREDNI |
| AUTH-REG-005 | Rejestracja - brakujące pola | 1. Wyślij POST /auth/register<br>2. Sprawdź response | login: ""<br>email: "test@example.com" | HTTP 400<br>error: "Wszystkie pola są wymagane" | Negatywny | KRYTYCZNY |
| AUTH-REG-006 | Rejestracja - użytkownik już istnieje | 1. Wyślij POST /auth/register<br>2. Sprawdź błąd | login: "existinguser"<br>email: "test@example.com"<br>password: "password123" | HTTP 400<br>error: "Użytkownik już istnieje" | Negatywny | SREDNI |

### Testy Logowania

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| AUTH-LOG-001 | Logowanie - prawidłowe dane | 1. Wyślij POST /auth/login<br>2. Sprawdź status<br>3. Sprawdź token i dane użytkownika | login: "testuser"<br>password: "password123" | HTTP 200<br>token: "mock-token"<br>user.login: "testuser" | Pozytywny | - |
| AUTH-LOG-002 | Logowanie - nieprawidłowe hasło | 1. Wyślij POST /auth/login<br>2. Sprawdź błąd | login: "testuser"<br>password: "wrongpassword" | HTTP 401<br>error: "Nieprawidłowe dane logowania" | Negatywny | KRYTYCZNY |
| AUTH-LOG-003 | Logowanie - użytkownik nie istnieje | 1. Wyślij POST /auth/login<br>2. Sprawdź błąd | login: "nonexistent"<br>password: "password123" | HTTP 401<br>error: "Nieprawidłowe dane logowania" | Negatywny | KRYTYCZNY |
| AUTH-LOG-004 | Logowanie - brakujące dane | 1. Wyślij POST /auth/login<br>2. Sprawdź błąd | login: ""<br>password: "" | HTTP 400<br>error: "Login i hasło są wymagane" | Negatywny | SREDNI |
| AUTH-LOG-005 | Logowanie - tylko login | 1. Wyślij POST /auth/login | login: "testuser" | HTTP 400<br>error: "Login i hasło są wymagane" | Negatywny | SREDNI |
| AUTH-LOG-006 | Logowanie - tylko hasło | 1. Wyślij POST /auth/login | password: "password123" | HTTP 400<br>error: "Login i hasło są wymagane" | Negatywny | NISKI |

---

## 2. INSTAGRAM.ROUTER.TEST.JS

### Testy Pobierania Profilu Instagram

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| IG-PROF-001 | Pobranie profilu - istniejący użytkownik | 1. Wyślij GET /instagram/testuser<br>2. Sprawdź status<br>3. Sprawdź dane w response | username: "testuser" | HTTP 200<br>Zwrócone: username, followers, following, posts | Pozytywny | - |
| IG-PROF-002 | Pobranie profilu - nieistniejący użytkownik | 1. Wyślij GET /instagram/nonexistent<br>2. Sprawdź status błędu | username: "nonexistent" | HTTP 404<br>error: "Profil nie istnieje" | Negatywny | SREDNI |
| IG-PROF-003 | Pobranie profilu - timeout | 1. Mock timeout w puppeteer<br>2. Wyślij GET /instagram/testuser<br>3. Sprawdź błąd | username: "testuser" | HTTP 408<br>error: "Przekroczono limit czasu" | Negatywny | KRYTYCZNY |
| IG-PROF-004 | Pobranie profilu - bot detection | 1. Mock błąd wykrycia bota<br>2. Wyślij GET /instagram/testuser<br>3. Sprawdź błąd | username: "testuser" | HTTP 403<br>error zawiera: "wykrył automatyczne pobieranie" | Negatywny | SREDNI |
| IG-PROF-005 | Pobranie profilu - błąd puppeteer | 1. Mock błąd w puppeteer<br>2. Wyślij GET /instagram/testuser | username: "testuser" | HTTP 500<br>Zwrócony error | Negatywny | KRYTYCZNY |

### Testy Integracji z Bazą Danych

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| IG-DB-001 | Zapis profilu do bazy | 1. Pobierz profil Instagram<br>2. Sprawdź czy InstagramProfile.findOneAndUpdate() został wywołany | username: "testuser" | findOneAndUpdate() wywoływany<br>Dane zapisane w DB | Pozytywny | - |
| IG-DB-002 | Błąd zapisu do bazy | 1. Mock błąd findOneAndUpdate<br>2. Wyślij żądanie pobrania profilu | username: "testuser" | HTTP 500<br>Error message | Negatywny | KRYTYCZNY |

---

## 3. HELPERS.TEST.JS

### Testy funkcji generateWarnings()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| HELP-GEN-001 | GenerateWarnings - profil null | 1. Wywołaj generateWarnings(null)<br>2. Sprawdź rezultat | profile: null | Zwrócona pusta tablica [] | Graniczny | SREDNI |
| HELP-GEN-002 | GenerateWarnings - profil undefined | 1. Wywołaj generateWarnings(undefined) | profile: undefined | Zwrócona pusta tablica [] | Graniczny | SREDNI |
| HELP-GEN-003 | GenerateWarnings - wysoka liczba obserwowanych | 1. Utwórz profil z following > followers * 5<br>2. Wywołaj generateWarnings() | followers: 100, following: 600 | Warning: "Wysoka liczba obserwowanych..." | Pozytywny | - |
| HELP-GEN-004 | GenerateWarnings - mało postów | 1. Utwórz profil z followers > 1000 i posts < 10<br>2. Wywołaj generateWarnings() | followers: 5000, posts: 5 | Warning: "Mała liczba postów..." | Pozytywny | - |
| HELP-GEN-005 | GenerateWarnings - niska średnia ocena | 1. Utwórz profil z avgRating < 2 i reviewCount > 5 | avgRating: 1.5, reviewCount: 20 | Warning: "Niska średnia ocena..." | Pozytywny | - |
| HELP-GEN-006 | GenerateWarnings - brak recenzji | 1. Utwórz profil z reviewCount === 0 | reviewCount: 0 | Warning: "Brak recenzji..." | Pozytywny | - |

### Testy funkcji formatNumber()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| HELP-FMT-001 | FormatNumber - liczby poniżej 1000 | 1. Wywołaj formatNumber(500) | num: 500 | Zwrócone: "500" | Pozytywny | - |
| HELP-FMT-002 | FormatNumber - liczby z przyrostkiem K | 1. Wywołaj formatNumber(1500) | num: 1500 | Zwrócone: "1.5K" | Pozytywny | - |
| HELP-FMT-003 | FormatNumber - liczby z przyrostkiem M | 1. Wywołaj formatNumber(2500000) | num: 2500000 | Zwrócone: "2.5M" | Pozytywny | - |
| HELP-FMT-004 | FormatNumber - zero | 1. Wywołaj formatNumber(0) | num: 0 | Zwrócone: "0" | Graniczny | NISKI |

### Testy funkcji validateEmail()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| HELP-VEM-001 | ValidateEmail - prawidłowy email | 1. Wywołaj validateEmail('test@example.com') | email: "test@example.com" | Zwrócone: true | Pozytywny | - |
| HELP-VEM-002 | ValidateEmail - email z podwójną kropką | 1. Wywołaj validateEmail('test..test@domain.com') | email: "test..test@domain.com" | Zwrócone: false | Negatywny | SREDNI |
| HELP-VEM-003 | ValidateEmail - email bez @ | 1. Wywołaj validateEmail('testexample.com') | email: "testexample.com" | Zwrócone: false | Negatywny | SREDNI |
| HELP-VEM-004 | ValidateEmail - pusty email | 1. Wywołaj validateEmail('') | email: "" | Zwrócone: false | Negatywny | NISKI |
| HELP-VEM-005 | ValidateEmail - email null | 1. Wywołaj validateEmail(null) | email: null | Zwrócone: false | Graniczny | NISKI |
| HELP-VEM-006 | ValidateEmail - email z kropką na początku | 1. Wywołaj validateEmail('.test@domain.com') | email: ".test@domain.com" | Zwrócone: false | Negatywny | NISKI |

### Testy funkcji validateUsername()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| HELP-VUN-001 | ValidateUsername - prawidłowa nazwa | 1. Wywołaj validateUsername('testuser') | username: "testuser" | Zwrócone: true | Pozytywny | - |
| HELP-VUN-002 | ValidateUsername - nazwa za krótka | 1. Wywołaj validateUsername('ab') | username: "ab" | Zwrócone: false | Graniczny | SREDNI |
| HELP-VUN-003 | ValidateUsername - nazwa za długa | 1. Wywołaj validateUsername('a' * 31) | username: "31 znaków" | Zwrócone: false | Graniczny | SREDNI |
| HELP-VUN-004 | ValidateUsername - nazwa z niedozwolonym znakiem | 1. Wywołaj validateUsername('user@name') | username: "user@name" | Zwrócone: false | Negatywny | NISKI |
| HELP-VUN-005 | ValidateUsername - nazwa ze spacją | 1. Wywołaj validateUsername('user name') | username: "user name" | Zwrócone: false | Negatywny | NISKI |
| HELP-VUN-006 | ValidateUsername - pusta nazwa | 1. Wywołaj validateUsername('') | username: "" | Zwrócone: false | Negatywny | NISKI |
| HELP-VUN-007 | ValidateUsername - null | 1. Wywołaj validateUsername(null) | username: null | Zwrócone: false | Graniczny | NISKI |

---

## 4. CALCULATETRUSTLEVEL.TEST.JS

### Testy funkcji calculateTrustLevel()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| TRUST-001 | TrustLevel - profil null | 1. Wywołaj calculateTrustLevel(null) | profile: null | Zwrócone: 0 | Graniczny | SREDNI |
| TRUST-002 | TrustLevel - profil undefined | 1. Wywołaj calculateTrustLevel(undefined) | profile: undefined | Zwrócone: 0 | Graniczny | SREDNI |
| TRUST-003 | TrustLevel - pusty profil | 1. Wywołaj calculateTrustLevel({}) | profile: {} | Zwrócone: 0 | Graniczny | SREDNI |
| TRUST-004 | TrustLevel - wysoki poziom zaufania | 1. Utwórz profil z dobrymi wskaźnikami<br>2. Wywołaj calculateTrustLevel() | followers: 50000, following: 1000, posts: 200, avgRating: 4.5, reviewCount: 100 | Wynik > 80 i <= 100 | Pozytywny | - |
| TRUST-005 | TrustLevel - niski poziom zaufania | 1. Utwórz profil ze słabymi wskaźnikami<br>2. Wywołaj calculateTrustLevel() | followers: 10, following: 5000, posts: 2, avgRating: 1.5, reviewCount: 1 | Wynik < 30 | Pozytywny | - |
| TRUST-006 | TrustLevel - średni poziom zaufania | 1. Utwórz profil ze średnimi wskaźnikami | followers: 1500, following: 800, posts: 75, avgRating: 3.2, reviewCount: 25 | Wynik między 40 i 70 | Pozytywny | - |
| TRUST-007 | TrustLevel - maksymalna wartość | 1. Utwórz profil z najlepszymi możliwymi wskaźnikami<br>2. Sprawdź czy nie przekracza 100 | followers: 1000000, following: 100, posts: 1000, avgRating: 5, reviewCount: 1000 | Zwrócone: <= 100 | Graniczny | SREDNI |
| TRUST-008 | TrustLevel - brakujące pola | 1. Utwórz profil z tylko followers i following<br>2. Wywołaj calculateTrustLevel() | followers: 1000, following: 500 | Wynik > 0 i < 50 | Pozytywny | - |
| TRUST-009 | TrustLevel - stosunek followers/following | 1. Utwórz profil z followers > following * 2 | followers: 1000, following: 400 | Score zawiera +20 (wysoki stosunek) | Pozytywny | - |
| TRUST-010 | TrustLevel - dużo postów | 1. Utwórz profil z posts > 100 | posts: 200 | Score zawiera +15 | Pozytywny | - |

---

## 5. PARSENUMBERWITHSUFFIX.TEST.JS

### Testy funkcji parseNumberWithSuffix()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| PARSE-001 | ParseNumber - liczba bez przyrostka | 1. Wywołaj parseNumberWithSuffix('1000') | str: "1000" | Zwrócone: 1000 | Pozytywny | - |
| PARSE-002 | ParseNumber - liczba z przyrostkiem K | 1. Wywołaj parseNumberWithSuffix('1K') | str: "1K" | Zwrócone: 1000 | Pozytywny | - |
| PARSE-003 | ParseNumber - liczba ułamkowa z K | 1. Wywołaj parseNumberWithSuffix('1.5K') | str: "1.5K" | Zwrócone: 1500 | Pozytywny | - |
| PARSE-004 | ParseNumber - liczba z przyrostkiem M | 1. Wywołaj parseNumberWithSuffix('1M') | str: "1M" | Zwrócone: 1000000 | Pozytywny | - |
| PARSE-005 | ParseNumber - liczba z przyrostkiem B | 1. Wywołaj parseNumberWithSuffix('1B') | str: "1B" | Zwrócone: 1000000000 | Pozytywny | - |
| PARSE-006 | ParseNumber - liczba z przyrostkiem T | 1. Wywołaj parseNumberWithSuffix('1T') | str: "1T" | Zwrócone: 1000000000000 | Pozytywny | - |
| PARSE-007 | ParseNumber - liczba z przyrostkiem Q | 1. Wywołaj parseNumberWithSuffix('1Q') | str: "1Q" | Zwrócone: 1000000000000000 | Pozytywny | - |
| PARSE-008 | ParseNumber - pusty string | 1. Wywołaj parseNumberWithSuffix('') | str: "" | Zwrócone: 0 | Graniczny | SREDNI |
| PARSE-009 | ParseNumber - null | 1. Wywołaj parseNumberWithSuffix(null) | str: null | Zwrócone: 0 | Graniczny | SREDNI |
| PARSE-010 | ParseNumber - undefined | 1. Wywołaj parseNumberWithSuffix(undefined) | str: undefined | Zwrócone: 0 | Graniczny | SREDNI |
| PARSE-011 | ParseNumber - nieprawidłowy tekst | 1. Wywołaj parseNumberWithSuffix('abc') | str: "abc" | Zwrócone: 0 | Negatywny | SREDNI |
| PARSE-012 | ParseNumber - liczba z przecinkami | 1. Wywołaj parseNumberWithSuffix('1,000') | str: "1,000" | Zwrócone: 1000 | Pozytywny | - |
| PARSE-013 | ParseNumber - liczba z spacjami | 1. Wywołaj parseNumberWithSuffix('1 000') | str: "1 000" | Zwrócone: 1000 | Pozytywny | - |
| PARSE-014 | ParseNumber - małe litery przyrostka | 1. Wywołaj parseNumberWithSuffix('1k') | str: "1k" | Zwrócone: 1000 | Pozytywny | - |
| PARSE-015 | ParseNumber - liczba 999K | 1. Wywołaj parseNumberWithSuffix('999K') | str: "999K" | Zwrócone: 999000 | Pozytywny | - |

---

## 6. PARSEINSTAGRAMDESCRIPTION.TEST.JS

### Testy funkcji parseInstagramDescription()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| IG-DESC-001 | ParseDescription - pusty opis | 1. Wywołaj parseInstagramDescription('', 'testuser') | description: "", username: "testuser" | Zwrócone: null | Graniczny | SREDNI |
| IG-DESC-002 | ParseDescription - null | 1. Wywołaj parseInstagramDescription(null, 'testuser') | description: null, username: "testuser" | Zwrócone: null | Graniczny | SREDNI |
| IG-DESC-003 | ParseDescription - undefined | 1. Wywołaj parseInstagramDescription(undefined, 'testuser') | description: undefined, username: "testuser" | Zwrócone: null | Graniczny | SREDNI |
| IG-DESC-004 | ParseDescription - pełny format | 1. Wywołaj parseInstagramDescription() z pełnym formatem | description: "1.2K Followers, 500 Following, 100 Posts - John Doe (@johndoe) on Instagram: Love photography" | followers: 1200, following: 500, posts: 100, fullName: "John Doe", username: "johndoe", bio: "Love photography" | Pozytywny | - |
| IG-DESC-005 | ParseDescription - format bez bio | 1. Wywołaj parseInstagramDescription() bez bio | description: "500 Followers, 200 Following, 50 Posts - John Doe (@johndoe) on Instagram:" | bio: "Brak opisu" | Pozytywny | - |
| IG-DESC-006 | ParseDescription - format podstawowy | 1. Wywołaj parseInstagramDescription() format basic | description: "500 Followers, 200 Following, 50 Posts" | fullName: "testuser", username: "testuser", bio: "Brak opisu" | Pozytywny | - |
| IG-DESC-007 | ParseDescription - duże liczby z przyrostkami | 1. Wywołaj parseInstagramDescription() z K, M | description: "1.5M Followers, 300 Following, 2.5K Posts - Celebrity (@celebrity) on Instagram: Famous" | followers: 1500000, following: 300, posts: 2500 | Pozytywny | - |
| IG-DESC-008 | ParseDescription - nie można sparsować | 1. Wywołaj parseInstagramDescription() z nieprawidłowym formatem | description: "To jest tylko tekst" | Zwrócone: null | Negatywny | SREDNI |
| IG-DESC-009 | ParseDescription - format z liczbami bez przyrostka | 1. Wywołaj parseInstagramDescription() | description: "1000 Followers, 500 Following, 100 Posts" | followers: 1000, following: 500, posts: 100 | Pozytywny | - |
| IG-DESC-010 | ParseDescription - obsługa spacji w bio | 1. Wywołaj parseInstagramDescription() z wieloma spacjami | description: "500 Followers Posts - Name (@user) on Instagram: Bio z wieloma spacjami" | bio: "Bio z wieloma spacjami" (znormalizowane) | Pozytywny | - |

---

## 7. DELAY.TEST.JS

### Testy funkcji delay()

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| DELAY-001 | Delay - opóźnienie 100ms | 1. Zarejestruj czas start<br>2. Wykonaj delay(100)<br>3. Zarejestruj czas end<br>4. Sprawdź różnicę | ms: 100 | Czas różnicy >= 100ms i < 150ms | Pozytywny | - |
| DELAY-002 | Delay - opóźnienie 50ms | 1. Zarejestruj czas start<br>2. Wykonaj delay(50)<br>3. Sprawdź różnicę czasu | ms: 50 | Czas różnicy >= 50ms i < 100ms | Pozytywny | - |
| DELAY-003 | Delay - zero milisekund | 1. Zarejestruj czas start<br>2. Wykonaj delay(0)<br>3. Sprawdź różnicę | ms: 0 | Czas różnicy < 50ms | Graniczny | NISKI |
| DELAY-004 | Delay - zwraca Promise | 1. Wykonaj delay(10)<br>2. Sprawdź czy zwrócone to Promise | ms: 10 | Zwrócone: instanceof Promise === true | Pozytywny | - |
| DELAY-005 | Delay - ujemne wartości | 1. Wykonaj delay(-100)<br>2. Sprawdź czy funkcja się nie zawiesza | ms: -100 | Czas różnicy < 50ms (brak opóźnienia) | Graniczny | NISKI |
| DELAY-006 | Delay - wiele opóźnień sekwencyjnie | 1. Wykonaj delay(50)<br>2. Wykonaj delay(50)<br>3. Sprawdź łączny czas | ms: 50 x 2 | Łączny czas >= 100ms | Pozytywny | - |
| DELAY-007 | Delay - równoległe opóźnienia | 1. Wykonaj Promise.all([delay(50), delay(50)])<br>2. Sprawdź czas | ms: 50 x 2 (parallel) | Czas <= 100ms (parallel execution) | Pozytywny | - |

---

## Podsumowanie Testów

| Moduł | Razem testów | Przechodzące | Krytyczne | Srednie | Niskie |
|-------|---|---|---|---|---|
| AUTH.ROUTER | 12 | 2 | 4 | 4 | 2 |
| INSTAGRAM.ROUTER | 7 | 2 | 2 | 2 | 1 |
| HELPERS | 16 | 10 | 0 | 4 | 2 |
| CALCULATETRUSTLEVEL | 10 | 10 | 0 | 0 | 0 |
| PARSENUMBERWITHSUFFIX | 15 | 15 | 0 | 0 | 0 |
| PARSEINSTAGRAMDESCRIPTION | 10 | 10 | 0 | 0 | 0 |
| DELAY | 7 | 7 | 0 | 0 | 0 |
| **RAZEM** | **77** | **56** | **6** | **10** | **5** |

---

## Legenda Priorytetów

| Priorytet | Znaczenie | Akcja |
|-----------|-----------|-------|
| KRYTYCZNY | Bezpieczeństwo, autentykacja, kluczowa funkcjonalność | MUSI być naprawiony przed deploymentem |
| SREDNI | Funkcjonalność biznesowa, user experience | Powinien być naprawiony przed deploymentem |
| NISKI | Edge case'i, validation, kosmetyczne błędy | Można wdrożyć z uwagą |

---

## Konwencje Testowania

### Typy testów:
- Pozytywny - Sprawdzenie poprawnego działania
- Negatywny - Sprawdzenie obsługi błędów
- Graniczny - Testowanie wartości brzegowych (null, undefined, puste wartości)

### Framework:
- Jest - Framework testowy
- Supertest - Testing HTTP endpoints
- Mock - Mockowanie funkcji i modułów

### Uruchomienie testów:
```
npm test                             # Uruchom wszystkie testy
npm test -- auth.router.test        # Uruchom konkretny plik
npm test -- --coverage              # Pokaż coverage
npm test -- --watch                 # Watch mode
npm test -- --testNamePattern=AUTH  # Uruchom testy zawierające "AUTH"
```
