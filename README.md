# Aksjeportefølje Management System

En moderne webapplikasjon for å administrere din aksjeportefølje, bygget med Next.js, TypeScript, og Tailwind CSS.

## 🎯 Fase 1: Foundation + Design + Dashboard (FERDIG)

Denne implementeringen inkluderer:

- ✅ Next.js prosjektoppsett med TypeScript og Tailwind CSS
- ✅ shadcn/ui komponentbibliotek
- ✅ Database schema for Supabase
- ✅ Autentisering med NextAuth.js
- ✅ Responsivt design system
- ✅ Dashboard med KPI-kort og beholdningskort
- ✅ Mock data for testing

## 🚀 Kom i gang

### Forutsetninger

- Node.js 18+ installert
- npm eller yarn
- Supabase-konto (for produksjon)

### Installasjon

1. Klon repositoryet:
```bash
git clone <your-repo-url>
cd Stockportefolio
```

2. Installer dependencies:
```bash
npm install
```

3. Konfigurer miljøvariabler:
Oppdater `.env.local` med dine egne verdier:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Generer NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

5. Kjør utviklingsserver:
```bash
npm run dev
```

6. Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## 🧪 Testing (Fase 1)

For Fase 1 fungerer autentiseringen med mock data:
- **Login**: Bruk hvilken som helst e-postadresse og passord
- **Dashboard**: Viser mock data for 2 aksjebeholdninger (1 aktiv, 1 solgt)

## 📁 Prosjektstruktur

```
Stockportefolio/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Autentiseringssider
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Dashboard-sider
│   ├── api/                 # API-ruter
│   │   └── auth/
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Hjemmeside
├── components/              # React-komponenter
│   ├── dashboard/           # Dashboard-komponenter
│   ├── layout/              # Layout-komponenter
│   ├── providers/           # Context providers
│   └── ui/                  # shadcn/ui komponenter
├── lib/                     # Utility-funksjoner
│   ├── auth.ts             # NextAuth-konfigurasjon
│   ├── db.ts               # Supabase-klient
│   ├── mock-data.ts        # Mock data for testing
│   └── utils.ts            # Hjelpefunksjoner
├── types/                   # TypeScript type definisjoner
│   ├── database.ts         # Database-typer
│   └── holdings.ts         # Beholdning-typer
└── public/                  # Statiske filer
```

## 🎨 Funksjoner

### Dashboard
- **KPI-kort**: Viser total kostverdi, gevinst, dagens verdi, og utbytte
- **Beholdningskort**: Detaljert visning av hver aksjebeholdning
- **Action Bar**: Knapper for å legge til transaksjoner og utbytte
- **Responsive design**: Fungerer på mobil, tablet, og desktop

### Autentisering
- Login-side med NextAuth.js
- Registrerings-side (mock for Fase 1)
- Beskyttet dashboard-rute

## 🗄️ Database Schema

For produksjon, kjør SQL-scriptet fra `PHASE_1_IMPLEMENTATION.md` i Supabase SQL Editor for å opprette:
- `users` - Brukerkontoer
- `portfolios` - Porteføljer
- `holdings` - Aksjebeholdninger
- `transactions` - Kjøp/salg-transaksjoner
- `dividends` - Utbyttebetalinger

## 🔄 Neste steg (Fase 2+)

Fase 1 er nå komplett med mock data. Fremtidige faser vil inkludere:

- **Fase 2**: Transaksjonsregistrering og beregninger
- **Fase 3**: Utbyttehåndtering
- **Fase 4**: Dokumentopplasting og parsing
- **Fase 5**: Prisoppdateringer og rapporter

## 🛠️ Teknologi-stack

- **Framework**: Next.js 15 (App Router)
- **Språk**: TypeScript
- **Styling**: Tailwind CSS
- **UI-komponenter**: shadcn/ui
- **Autentisering**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **Ikoner**: Lucide React

## 📝 Lisens

Dette er et privat prosjekt.

## 🤝 Bidrag

Dette er et personlig prosjekt. Kontakt eieren for bidrag.
