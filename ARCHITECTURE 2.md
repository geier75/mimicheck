# MiMiCheck Architektur

## Übersicht

MiMiCheck ist eine React-basierte SPA für die Verwaltung von Sozialleistungsanträgen.

## Technologie-Stack

| Layer | Technologie |
|-------|-------------|
| Frontend | React 18, Vite, TailwindCSS |
| UI Components | Radix UI, shadcn/ui |
| State | React Context API |
| Routing | React Router v7 |
| Backend | Supabase (Auth, DB, Storage) |
| Payments | Stripe |
| i18n | i18next |

## Verzeichnisstruktur

```
src/
├── api/                    # API Layer
│   ├── supabaseClient.js   # Supabase-Verbindung
│   ├── supabaseEntities.js # Entity CRUD-Operationen
│   ├── mimitechClient.js   # Abstraktionsschicht
│   ├── entities.js         # Re-Export für einfachen Import
│   ├── functions.js        # Supabase Edge Functions
│   └── integrations.js     # Externe Integrationen
├── components/
│   ├── profil/             # Profil-Sektionen (refaktoriert)
│   ├── ui/                 # Basis UI-Komponenten
│   ├── notifications/      # Benachrichtigungssystem
│   └── [Feature]/          # Feature-spezifische Komponenten
├── pages/                  # Seiten-Komponenten
├── routes/                 # Routing-Konfiguration
├── utils/                  # Utilities
│   ├── logger.js           # Produktions-sicheres Logging
│   ├── errorHandler.js     # Zentrales Error-Handling
│   └── apiClient.js        # HTTP-Client mit Retry-Logik
├── services/               # Business-Logik Services
├── i18n/                   # Internationalisierung
└── test/                   # Test-Setup und Mocks
```

## State Management

Die App nutzt React Context für globalen State:

- **UserProfileContext** - Benutzerprofil und Auth-Status
- **NotificationContext** - Toast-Benachrichtigungen
- **LanguageContext** - Aktuelle Sprache
- **LoaderContext** - Globaler Lade-Status
- **AgentContext** - AI-Assistenten-State

## API Layer

```
┌─────────────────┐
│   Komponenten   │
└────────┬────────┘
         │
    ┌────▼────┐
    │entities │  (Import-Alias)
    └────┬────┘
         │
 ┌───────▼───────┐
 │mimitechClient │  (Abstraktionsschicht)
 └───────┬───────┘
         │
┌────────▼────────┐
│supabaseEntities │  (CRUD-Operationen)
└────────┬────────┘
         │
 ┌───────▼───────┐
 │supabaseClient │  (Supabase SDK)
 └───────────────┘
```

## Security

- **Umgebungsvariablen**: Alle Secrets in `.env` (gitignored)
- **Auth**: Supabase Auth mit RLS (Row Level Security)
- **API-Keys**: Nie hardcoded im Frontend
- **DSGVO**: Einwilligungsmanagement implementiert

## Performance

- **Code-Splitting**: Vendor-Chunks für große Bibliotheken
- **Lazy Loading**: Verfügbar für selten genutzte Seiten
- **Memoization**: React.memo für teure Komponenten

## Best Practices

1. **Error Handling**: Nutze `handleError()` aus `@/utils`
2. **Logging**: Nutze `logger` statt `console.log`
3. **API-Calls**: Nutze `api` Client mit eingebautem Retry
4. **Forms**: Kontrollierte Inputs mit `handleChange` Pattern
5. **Tests**: Mocks in `src/test/mocks/` für externe Services
