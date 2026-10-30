# Oppsett av innlogging (Firebase)

Innloggingen bruker Firebase (gratis Spark-plan). Dataene dine lagres per bruker, og kun du kan lese dem.

1. Gå til https://console.firebase.google.com og trykk **Add project**. Gi det et navn og trykk deg gjennom (Google Analytics kan slås av).
2. I prosjektet: trykk på **</>** (Web) for å legge til en web-app. Gi den et navn. Du får et `firebaseConfig`-objekt. Det trenger du i steg 6.
3. **Build → Authentication → Get started → Sign-in method → Email/Password** → slå på og lagre.
4. **Build → Firestore Database → Create database**. Velg en region i Europa (for eksempel `eur3`) og start i **production mode**.
5. I Firestore, fanen **Rules**: erstatt innholdet med dette og trykk **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

6. Åpne `firebase-config.js`, erstatt `null` med objektet fra steg 2 (se eksempelet i filen), og push til GitHub.

Første gang du logger inn med en ny konto, tas dataene som ligger i nettleseren din med til kontoen.
