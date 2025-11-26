# Scenariusze Testowe - FRONTEND (Komponenty React)

**Projekt:** InstagramChecker  
**Data:** 2025-11-26  
**Wersja:** 2.2

---

## Środowiska Testowe

| Parametr | Wartość |
|---|---|
| Urządzenie | MacBook Air |
| Procesor | Apple M2 |
| Pamięć RAM | 8 GB |
| System operacyjny | macOS Sequoia 15.6.1 |
| Node Version | 18.x |
| Port | localhost:3000 |
| React Version | 18.x |

---

## Spis treści

1. [APP.TEST.JSX](#1-apptestjsx)
2. [HOMEPAGE.TEST.JSX](#2-hometestjsx)
3. [PROFILESEARCHPAGE.TEST.JSX](#3-profilesearchpagetestjsx)
4. [ADDREVIEWPAGE.TEST.JSX](#4-addreviewpagetestjsx)

---

## 1. APP.TEST.JSX

### Testy Komponentu App

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| APP-001 | App - renderuje komunikat ładowania | 1. Renderuj komponent App<br>2. Sprawdź czy pojawia się "Ładowanie..."<br>3. Sprawdź czy element jest widoczny | Brak | DOM zawiera tekst "Ładowanie..." | Pozytywny | KRYTYCZNY |
| APP-002 | App - załadowanie danych użytkownika | 1. Mockuj fetch z danymi<br>2. Renderuj App<br>3. Czekaj na załadowanie<br>4. Sprawdź dane | login: "testuser" | Tekst "Witaj, testuser" widoczny w DOM | Pozytywny | KRYTYCZNY |
| APP-003 | App - obsługa błędu załadowania | 1. Mockuj failed fetch<br>2. Renderuj App<br>3. Sprawdź komunikat błędu | Błąd sieci | Komunikat "Błąd przy załadowaniu danych" | Negatywny | SREDNI |
| APP-004 | App - renderuje navbar | 1. Renderuj App po załadowaniu<br>2. Sprawdź logotyp<br>3. Sprawdź menu nawigacji | Dane załadowane | Navbar z logo i menu nawigacyjne | Pozytywny | SREDNI |
| APP-005 | App - responsywność na mobile | 1. Ustaw viewport mobile (375x667)<br>2. Renderuj App<br>3. Sprawdź layout | Mobile | Elementy responsywne, menu przeniesione | Pozytywny | SREDNI |

---

## 2. HOMEPAGE.TEST.JSX

### Testy Głównej Strony

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| HOME-001 | HomePage - wyświetla sekcję ostatnich profili | 1. Mockuj fetch profili<br>2. Renderuj HomePage<br>3. Czekaj na dane<br>4. Sprawdź listę profili | profiles: [{username: "janek", followers: 1200}] | Tekst "Ostatnio sprawdzone profile" widoczny | Pozytywny | KRYTYCZNY |
| HOME-002 | HomePage - wyświetla karty profili | 1. Załaduj 3 profile testowe<br>2. Renderuj HomePage<br>3. Sprawdź ilość kart | username: ["janek", "marta", "piotr"] | Dokładnie 3 karty profilu w DOM | Pozytywny | KRYTYCZNY |
| HOME-003 | HomePage - klik na profil otwiera szczegóły | 1. Renderuj HomePage<br>2. Kliknij na kartę profilu<br>3. Sprawdź nawigację | username: "janek" | Navigacja do /profile/janek | Pozytywny | SREDNI |
| HOME-004 | HomePage - pusta lista profili | 1. Mockuj pusty fetch<br>2. Renderuj HomePage<br>3. Sprawdź komunikat | profiles: [] | Komunikat "Brak ostatnich profili" | Pozytywny | SREDNI |
| HOME-005 | HomePage - ładowanie profili | 1. Renderuj HomePage<br>2. Przy załadowaniu spinner widoczny<br>3. Po załadowaniu spinner znika | Ładowanie danych | Spinner wyświetlony, potem elementy | Pozytywny | SREDNI |
| HOME-006 | HomePage - błąd przy pobieraniu profili | 1. Mockuj failed API<br>2. Renderuj HomePage<br>3. Sprawdź error boundary | API Error | Komunikat "Nie udało się pobrać profile" | Negatywny | SREDNI |

---

## 3. PROFILESEARCHPAGE.TEST.JSX

### Testy Wyszukiwania Profili

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| PSEARCH-001 | ProfileSearchPage - input przyjmuje tekst | 1. Renderuj ProfileSearchPage<br>2. Znajdź input pole<br>3. Wpisz "testprofil"<br>4. Sprawdź value | input: "testprofil" | Input zawiera "testprofil" | Pozytywny | KRYTYCZNY |
| PSEARCH-002 | ProfileSearchPage - klik przycisk szukaj | 1. Wpisz username w input<br>2. Kliknij "Szukaj"<br>3. Czekaj na API<br>4. Sprawdź wyniki | username: "testprofil" | Wyniki profilu wyświetlone | Pozytywny | KRYTYCZNY |
| PSEARCH-003 | ProfileSearchPage - wyświetla dane profilu | 1. Mockuj API z danymi<br>2. Wyszukaj profil<br>3. Sprawdź dane w DOM | username: "testprofil", followers: 2000, posts: 30 | @testprofil, 2000 followers, 30 postów widoczne | Pozytywny | KRYTYCZNY |
| PSEARCH-004 | ProfileSearchPage - profil nie istnieje | 1. Wyszukaj nieistniejący profil<br>2. Sprawdź komunikat błędu | username: "nieistniejacy" | Komunikat "Profil nie został znaleziony" | Negatywny | SREDNI |
| PSEARCH-005 | ProfileSearchPage - oblicza Trust Level | 1. Załaduj profil<br>2. Sprawdź wyświetlony Trust Level<br>3. Porównaj z wyliczonym | followers: 50000, posts: 200, avgRating: 4.5 | Trust Level > 80, kolor zielony | Pozytywny | SREDNI |
| PSEARCH-006 | ProfileSearchPage - wyświetla ostrzeżenia | 1. Załaduj profil podejrzany<br>2. Sprawdź pole warnings<br>3. Liczba ostrzeżeń > 0 | followers: 10, following: 5000 | Wyświetlone ostrzeżenia w kolorze żółtym/czerwonym | Pozytywny | SREDNI |
| PSEARCH-007 | ProfileSearchPage - przycisk dodaj opinię | 1. Załaduj profil<br>2. Sprawdź przycisk<br>3. Kliknij przycisk | Profil załadowany | Nawigacja do /add-review/testprofil | Pozytywny | SREDNI |
| PSEARCH-008 | ProfileSearchPage - loading state | 1. Kliknij szukaj<br>2. Spinner powinien być widoczny<br>3. Po załadowaniu znika | Ładowanie danych | Spinner wyświetlony, potem wyniki | Pozytywny | SREDNI |
| PSEARCH-009 | ProfileSearchPage - timeout API | 1. Mockuj fetch z opóźnieniem > timeout<br>2. Wyszukaj<br>3. Sprawdź timeout error | Timeout | Komunikat o timeout | Negatywny | SREDNI |
| PSEARCH-010 | ProfileSearchPage - wyczyszczenie formularza | 1. Wpisz username<br>2. Kliknij wyczyść<br>3. Sprawdź input | Dane wpisane | Input pusty, wyniki wyczyszczone | Pozytywny | NISKI |

---

## 4. ADDREVIEWPAGE.TEST.JSX

### Testy Dodawania Opinii

| ID | Nazwa testu | Kroki | Dane wejściowe | Oczekiwany rezultat | Typ testu | Priorytet |
|---|---|---|---|---|---|---|
| REVIEW-001 | AddReviewPage - renderuje formularz opinii | 1. Renderuj AddReviewPage<br>2. Sprawdź pola formularza<br>3. Sprawdź gwiazdki oceny | Brak | Formularz z pola tekstowego i gwiazdkami | Pozytywny | KRYTYCZNY |
| REVIEW-002 | AddReviewPage - ocena 1-5 gwiazdek | 1. Renderuj formularz<br>2. Kliknij gwiazdkę 4<br>3. Sprawdź stan | Klik na 4 gwiazdę | 4 gwiazdki zaznaczone | Pozytywny | KRYTYCZNY |
| REVIEW-003 | AddReviewPage - wpisanie opinii | 1. Renderuj formularz<br>2. Wpisz tekst opinii<br>3. Sprawdź textarea | text: "Świetny profil" | Textarea zawiera tekst | Pozytywny | SREDNI |
| REVIEW-004 | AddReviewPage - przycisk wysyłania | 1. Wypełnij gwiazdki<br>2. Wpisz opinię<br>3. Sprawdź czy przycisk enabled | Formularz wypełniony | Przycisk "Dodaj opinię" enabled | Pozytywny | SREDNI |
| REVIEW-005 | AddReviewPage - wysłanie opinii | 1. Wypełnij formularz<br>2. Kliknij "Dodaj opinię"<br>3. Czekaj na response | rating: 4, comment: "Fajne" | Komunikat sukcesu, redirect do profilu | Pozytywny | KRYTYCZNY |
| REVIEW-006 | AddReviewPage - duplikat opinii | 1. Użytkownik już ma opinię<br>2. Sprawdź komunikat<br>3. Przycisk powinien być disabled | Istniejąca opinia | "Już dodałeś opinię do tego profilu" | Negatywny | SREDNI |
| REVIEW-007 | AddReviewPage - walidacja pola tekstowego | 1. Zostaw textarea pusty<br>2. Sprawdź error<br>3. Przycisk disabled | Brak tekstu | Error message, przycisk disabled | Negatywny | SREDNI |
| REVIEW-008 | AddReviewPage - limit znaków opinii | 1. Wpisz > 500 znaków<br>2. Sprawdź counter<br>3. Możliwość wysłania | 600 znaków | Counter wyświetla 600/500, ostrzeżenie | Negatywny | SREDNI |
| REVIEW-009 | AddReviewPage - błąd wysyłania opinii | 1. Mockuj failed POST<br>2. Kliknij "Dodaj opinię"<br>3. Sprawdź error | API Error | Komunikat "Błąd przy dodawaniu opinii" | Negatywny | SREDNI |
| REVIEW-010 | AddReviewPage - ładowanie przy wysyłaniu | 1. Kliknij "Dodaj opinię"<br>2. Spinner powinien być widoczny<br>3. Po wysłaniu znika | Wysyłanie | Spinner i disabled przycisk, potem reset | Pozytywny | SREDNI |
| REVIEW-011 | AddReviewPage - anulowanie formularza | 1. Wypełnij formularz<br>2. Kliknij "Anuluj"<br>3. Cofnij nawigację | Dane wpisane | Powrót do poprzedniej strony | Pozytywny | NISKI |
| REVIEW-012 | AddReviewPage - validacja gwiazdek | 1. Nie zaznacz ocenę<br>2. Kliknij wysłij<br>3. Sprawdź error | Brak oceny | Error "Wybierz ocenę" | Negatywny | SREDNI |

---

## Podsumowanie Testów

| Komponent | Razem testów | Przechodzące | Krytyczne | Srednie | Niskie |
|-----------|---|---|---|---|---|
| APP | 5 | 3 | 2 | 2 | 0 |
| HOMEPAGE | 6 | 3 | 2 | 4 | 0 |
| PROFILESEARCHPAGE | 10 | 7 | 3 | 6 | 1 |
| ADDREVIEWPAGE | 12 | 6 | 3 | 8 | 1 |
| **RAZEM** | **33** | **19** | **10** | **20** | **2** |

---

## Legenda Priorytetów

| Priorytet | Znaczenie | Akcja |
|-----------|-----------|-------|
| KRYTYCZNY | Autentykacja, kluczowe funkcje, renderowanie | MUSI być naprawiony przed deploymentem |
| SREDNI | Funkcjonalność biznesowa, UX, walidacja | Powinien być naprawiony przed deploymentem |
| NISKI | Edge case'i, kosmetyczne błędy, animacje | Można wdrożyć z uwagą |

---

## Konwencje Testowania

### Narzędzia testowe:
- Jest - Framework testowy
- React Testing Library - Testowanie komponentów
- @testing-library/user-event - Symulacja interakcji użytkownika
- Vitest - Alternatywa do Jest

### Mockowanie:
- jest.fn() - Mockowanie funkcji
- fetch mock - Mockowanie API
- MemoryRouter - Testowanie routingu

### Selektory:
- getByText() - Wyszukiwanie po tekście
- getByRole() - Wyszukiwanie po role (button, input)
- getByPlaceholderText() - Wyszukiwanie po placeholder
- getByTestId() - Wyszukiwanie po data-testid

### Uruchomienie testów:
```
npm test                             # Uruchom wszystkie testy
npm test -- App.test                 # Uruchom konkretny plik
npm test -- --coverage               # Pokaż coverage
npm test -- --watch                  # Watch mode
npm test -- --testNamePattern=HOME   # Uruchom testy zawierające "HOME"
npm test -- --updateSnapshot         # Update snapshots
```

