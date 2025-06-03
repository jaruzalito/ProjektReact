# Instagram Checker

## A. Wykonanie:

- **Cichocki Adrian**
- **Jaruzal Marcel**

---

## B. Opis aplikacji:

Nasza aplikacja webowa – **Instagram Checker** pozwala sprawdzić konto użytkownika Instagrama.  
**W jakim celu?** W dzisiejszych czasach jeżeli zadzwoni do nas obcy numer, mało kto odbiera i pyta „kto tam?”. Głównie wchodzimy w internet i wpisujemy _to za numer xxx xxx xxx_.

> _Dlatego właśnie postanowiliśmy, że może warto stworzyć coś podobnego, ale dla użytkowników Instagrama._

Gdy zaobserwuje nas ktoś, kogo nie znamy, możemy sprawdzić na naszej stronie opinie o tym koncie — czy to bot, nachalny typ który wysyła zdjęcia, czy zwykły użytkownik. Naszą inspiracją były właśnie strony do sprawdzania numerów telefonów oraz słynna **tablica-rejestracyjna.pl** 🚗.

### Setup

```bash
# backend
npm install
docker compose up --build

# frontend
npm run dev

# fixtures w backendzie
npm run fixtures

Hasła testowe:
Login	Hasło
admin	admin123
testuser1	test123
reviewer1	revi123
moderator	mod123

## C. Podział prac:
Nie dzieliliśmy się na frontend i backend, tylko na moduły.

Marcel zainicjalizował środowisko i aplikację, przygotował moduły rejestracji i logowania, usprawnił je.

Adrian stworzył moduł do szukania użytkowników Instagrama, a później moduły oceniania i komentarzy.

Inne funkcjonalności wykonywaliśmy wspólnie na zasadzie dobra ja zrobie to, a ty zrobisz tamto ;)

## D Baza Danych:
<img alt="dbss" src="https://github.com/user-attachments/assets/52196267-e4b4-4303-8e19-36dbf6270d02">

<img alt="dbss" src="https://github.com/user-attachments/assets/eb0ae80c-4732-4bb1-9e52-58c161b43437">

<img alt="dbss" src="https://github.com/user-attachments/assets/8bb97ac4-b661-45a7-90c3-d2937f3e6ce5">

<img alt="dbss" src="https://github.com/user-attachments/assets/21efee9f-a4ad-4e1a-acfb-aa9b567b1a0f">

<img alt="dbss" src="https://github.com/user-attachments/assets/f9658a2e-ec42-4f7e-9bf5-c49dfb1b45ba">
```
