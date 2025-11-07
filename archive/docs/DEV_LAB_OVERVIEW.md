# Admin Dev Lab Overview

## Purpose

The Admin Dev Lab provides a "God View" of all backend systems, exposing hidden models and placeholder data structures for admin verification and sanity checking.

## Location

- **Page**: `/admin/dev-lab`
- **API Routes**: 
  - `/api/admin/systems` - Get all systems with counts
  - `/api/admin/[system]/list` - Get records for a specific system

## Features

### System Cards

Each system displays:
- **Name**: System title (e.g., "Economy / Treasury")
- **Record Count**: Total number of records across all models in the system
- **Status**: 
  - âœ… Active - Has records
  - âš ï¸ Empty - No records found
  - âŒ Error - Failed to query

### View Raw JSON

Click "View Raw JSON" on any card to:
- Fetch up to 5 records per model (configurable via `limit` param)
- Display records in a formatted JSON view
- Toggle to hide/show records

## Systems Tracked

1. **Economy / Treasury** (`economy`)
   - EconomyStat, Treasury, TaxTransaction, DynamicPrice

2. **Creator Economy** (`creator`)
   - CreatorWallet, CreatorTransaction, PayoutPool, EngagementMetric

3. **Localization** (`localization`)
   - TranslationKey, LanguagePreference, Language

4. **Regional Events** (`regional`)
   - RegionalEvent, RegionConfig, RegionSchedule

5. **Timezones** (`timezones`)
   - UserTimeZone

6. **Lore / Chronicle / Narrative** (`lore`)
   - LoreEntry, Chronicle, NarrativeQuest, WorldChronicle

7. **Moderation** (`moderation`)
   - ModerationAction, ModerationReport, Report

8. **Subscription** (`subscription`)
   - Subscription, UserSubscription, SubscriptionPlan

## Authentication

- Admin-only access via `requireAdmin()` from `@/lib/authGuard`
- Redirects to `/login` if not authenticated
- Redirects to `/main` if user is not an admin

## API Endpoints

### GET /api/admin/systems

Returns array of systems with counts:

```json
{
  "success": true,
  "data": {
    "systems": [
      {
        "name": "Economy / Treasury",
        "route": "economy",
        "modelCount": 150,
        "status": "active",
        "details": {
          "economyStat": 50,
          "treasury": 1,
          "taxTransaction": 99
        }
      }
    ],
    "timestamp": "2025-10-31T17:00:00.000Z"
  }
}
```

### GET /api/admin/[system]/list?limit=5

Returns records for a specific system:

```json
{
  "success": true,
  "data": {
    "system": "economy",
    "limit": 5,
    "records": {
      "economyStat": [...],
      "treasury": [...]
    },
    "timestamp": "2025-10-31T17:00:00.000Z"
  }
}
```

## Query Parameters

- `limit`: Number of records to fetch per model (default: 5, max: 100)
- `show_placeholders`: Include empty arrays for models with no records (default: false)

## Components

- **AdminSystemCard**: Reusable card component for displaying system info
- **DevLabPage**: SSR page that fetches and displays all systems

## Performance

- Lightweight: Only counts records (no full data fetch by default)
- Fast: Parallel queries for all systems
- Efficient: Limit enforced to prevent large data dumps

## Future Enhancements

- Filter by status (active/empty/error)
- Search systems by name
- Export system data
- Real-time updates
- System health metrics