# Utviklingslogg for Treningsbok

Hva som er bygd og endret i appen, dag for dag. Nyeste dag står øverst.

---

## Torsdag 5. november 2026

**Bedre økter**
- Alle sett lagres nå med vekt og reps, så appen husker nøyaktig hva du gjorde.
- «Sist»-linje under hver øvelse viser hva du gjorde forrige gang.
- Forslag om å øke: klarte du alle repetisjonene sist, foreslår appen litt mer vekt (eller én rep / fem sekunder til). «Bruk forslaget» fyller inn tallene.
- Holdøvelser (planke osv.) har egen tidtaker per sett som piper og krysser av settet når tiden er ute.
- Gi økta en vurdering (fra «Veldig lett» til «Helt maks») og skriv et notat før du fullfører.

**Mer fremgang**
- «Denne uka»: økter, treningstid, løftet vekt og nye rekorder, sammenlignet med forrige uke.
- Treningskalender med en rute per dag de siste 20 ukene.
- Graf per øvelse: estimert maks (1RM) eller beste sett over tid, pluss de siste gangene.
- Muskelgrupper: hvor mange sett hver muskelgruppe har fått siste 30 dager, og hva du ikke har trent.
- Trykk på en økt i historikken for å se alle settene, vurderingen og notatet.
- Rekordlisten viser estimert maks for vektøvelser.

**Ny fane: Mer**
- Kropp: logg vekt og midjemål, med grafer og endring siste 30 dager.
- Verktøy: skivekalkulator (hvilke skiver på hver side), maks-kalkulator med prosenttabell, og stoppeklokke med runder.
- Merker: 18 merker å samle, fra «Første økt» til «Hundre tonn», med fremdrift mot hvert merke.
- Innstillinger: navnet ditt (hilsen på I dag-kortet), lyd og vibrasjon av/på, standard hviletid, hvor mye forslagene øker med, stangvekt og hvilke skiver du har.
- Data og sikkerhetskopi: last ned alt som én fil, last ned historikken som regneark, gjenopprett fra fil og slett alle data.

**Installerbar app**
- Treningsbok kan legges på hjemskjermen og åpner da som en egen app med eget ikon.
- Appen virker uten nett. Det du gjør mens du er frakoblet lagres, og sendes til kontoen når du er på nett igjen.
- «Installer»-knapp i Mer-fanen (på iPhone står det hvordan du legger den til fra Safari).

---

## Onsdag 4. november 2026

**Nytt utseende i hele appen**
- På mobil ligger menyen nå fast nederst med ikoner, så alle fem fanene får plass. På PC har fanene fått ikoner.
- «I dag»-kortet er en mørk flate med svake banelinjer, som på en løpebane, og er lett å få øye på.
- Overskrifter og etiketter er skrevet med vanlige bokstaver i stedet for store bokstaver overalt.
- Roligere toppfelt: lagringsstatus vises som en farget prikk (grønn = lagret, rød = kunne ikke lagre).
- Mykere hjørner, luftigere dagkort, og «+ Legg til» på dagene er tonet ned.
- Tallene på Fremgang står side om side også på mobil.

**Intervalltimer**
- Ny intervalltimer øverst i Økt-fanen.
- Ferdige oppsett (Tabata 20/10 × 8, 30/30 × 10, 40/20 × 8, 45/15 × 6) eller egne tider og antall runder.
- Velg øvelser som går på omgang, én per runde, med animasjon av nåværende og neste øvelse.
- Pip de tre siste sekundene og ved hvert bytte, vibrasjon på mobil, og skjermen holdes på.
- Pause, Hopp over og Avslutt. Ferdige økter lagres i fremgangen og teller på ukemålet.

**Personlige rekorder**
- Appen husker tyngste vekt, flest reps i ett sett og lengste hold for hver øvelse.
- Rekorden vises under økta, og «Ny rekord» dukker opp med en gang du slår den.
- Fremgang viser en melding med ny og gammel verdi, og en liste over alle rekorder.
- Første gang en øvelse gjøres lagres den bare som utgangspunkt.
- Planen viser ikke lenger «× 0 kg» på øvelser uten vekt.

**Ny ukeplan**
- Flere økter samme dag, også intervalltimeren.
- Status på hver økt: Gjort, Ikke gjort eller Start, koblet mot det som faktisk er trent.
- I dag-kort øverst med Start-knapp, eller neste økt på hviledager.
- Fremdrift for planlagte økter, i tillegg til ukemålet.
- Så mange planer du vil: lag, gi nytt navn, kopier og slett.
- «Bare denne uka»: endre én uke uten å endre hele planen, med «Tilbakestill til planen».
- Gamle planer flyttes over automatisk.
- Mer luft mellom seksjonene i alle fanene.

**Animasjoner**
- Jumping jacks og burpees hopper nå, med skygge på bakken som krymper i lufta.
- Animasjonene er byttet fra strekfigurer til 3D-figurer: dukke med ledd, lys og skygge, rekvisitter i 3D og fargede muskler. Laget med en egen liten WebGL-motor, uten ekstern pakke. Strekfigurene brukes hvis 3D ikke virker.
- Bare animasjoner som er på skjermen tegnes, rundt 30 bilder i sekundet, for å spare batteri.
- Jumping jacks rettet: armene svinger i bue, knærne bøyer fremover og tærne peker frem.
- Burpees rettet: beina skytes bakover og inn igjen i ett hopp, og armene svinger fremover.

---

## Tirsdag 3. november 2026

**Animasjoner rettet og forbedret**
- Kroppsdelene som jobber mest er farget.
- Figurene fikk føtter og tær, mindre hode og egne skuldre og hofter forfra.
- Rettet armhevinger, pike-armhevinger, tåhev (nå på et trappetrinn), jumping jacks, høye knær, superman, hoftebøyerstrekk og hamstringstrekk.

---

## Mandag 2. november 2026

**Øvelsesanimasjoner**
- Animerte figurer for alle 21 hjemmeøvelser i øvelsesbiblioteket.
- «Vis hvordan»-knapp under hver øvelse i økta.
- Med «redusert bevegelse» står figuren stille, og du trykker for å bytte stilling.

---

## Fredag 30. oktober 2026

**Første versjon**
- Treningsbok: ukeplan, programmer, øktmodus med hviletimer og fremgang med diagram og historikk.
- Koden delt opp i `index.html`, `style.css` og `app.js`.
- Publisert med GitHub Pages.

**Hjemmetrening**
- Ny Hjemme-fane med seks ferdige hjemmeøkter og et øvelsesbibliotek med 21 øvelser.
- To ukeplaner: Vanlig uke og Hjemmeuke, med «Fyll med forslag».

**Utseende**
- Valg mellom automatisk, lys og mørk modus.
- Oransje aksentfarge i lys modus.
- Nettleseren tvinges til å hente nye filer etter oppdateringer.

**Innlogging**
- Innlogging med e-post og passord via Firebase, med «Opprett konto» og «Glemt passord».
- Dataene lagres på kontoen og følger deg mellom enheter.
- Tydeligere feilmelding og «Prøv igjen»-knapp hvis dataene ikke kan hentes.

---

## Torsdag 29. oktober 2026

- Repoet `Treningsapp` ble opprettet på GitHub.
