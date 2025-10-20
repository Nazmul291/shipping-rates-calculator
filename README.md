# Shopify Carrier Service - Next.js 15

Minimal Next.js 15 carrier service for Shopify custom shipping rates.

## Features

- ✓ Calculates shipping rates based on destination and weight
- ✓ Supports 41 countries with 2,272 rate combinations
- ✓ Insurance options (€250, €500, €1000)
- ✓ Simple homepage to check/register carrier service
- ✓ No UI libraries, no styles - pure functionality
- ✓ Built with Next.js 15 App Router

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update:

```env
SHOPIFY_STORE=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token
SHOPIFY_API_VERSION=2024-01
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### POST /api/shipping-rates

Shopify calls this endpoint to get shipping rates.

**Request** (from Shopify):
```json
{
  "rate": {
    "destination": {
      "country_code": "DE",
      ...
    },
    "items": [
      {
        "grams": 250,
        "quantity": 1,
        ...
      }
    ],
    "currency": "EUR"
  }
}
```

**Response**:
```json
{
  "rates": [
    {
      "service_name": "Pakje buitenland (0–250g, niet door brievenbus)",
      "service_code": "NON_MAILBOX_0_250",
      "total_price": "725",
      "description": "Package that does not fit through mailbox",
      "currency": "EUR"
    }
  ]
}
```

### GET /api/status

Check if carrier service is registered.

**Response**:
```json
{
  "registered": true,
  "carrier_service": {
    "id": 123,
    "name": "Custom Shipping Rates",
    "callback_url": "https://your-app.com/api/shipping-rates"
  }
}
```

### POST /api/register

Register carrier service with Shopify.

**Response**:
```json
{
  "success": true,
  "carrier_service": {
    "id": 123,
    "name": "Custom Shipping Rates"
  }
}
```

## Homepage

Visit `/` to:
- Check if carrier service is registered
- Register carrier service with one click
- View API endpoints

## Deployment

### Railway (Free)

1. Push to GitHub
2. Connect Railway to your repo
3. Set environment variables in Railway
4. Deploy!

### Render (Free)

1. Push to GitHub
2. Connect Render to your repo
3. Set environment variables
4. Deploy!

### Vercel (Free)

```bash
npm install -g vercel
vercel
```

## Project Structure

```
carrier-service/
├── app/
│   ├── api/
│   │   ├── shipping-rates/
│   │   │   └── route.ts        # Rate calculation endpoint
│   │   ├── register/
│   │   │   └── route.ts        # Carrier service registration
│   │   └── status/
│   │       └── route.ts        # Registration status check
│   └── page.tsx                # Homepage
├── data/
│   └── shipping-rates.json     # Rate data (41 countries)
├── .env.local                  # Environment variables
└── package.json
```

## How It Works

1. **Customer checks out** → Shopify sends cart details to `/api/shipping-rates`
2. **App calculates rates** → Based on weight, destination, and rate tables
3. **Returns shipping options** → Including insurance variations
4. **Customer selects option** → Proceeds with checkout

## Rate Data

The `data/shipping-rates.json` file contains rates for:
- **Non-mailbox** packages (0-2kg, 4 weight ranges)
- **Mailbox** packages (0-2kg, 6 weight ranges)
- **EU parcels** (0-31.5kg, 6 weight ranges)

Each with 4 insurance options (none, €250, €500, €1000).

## Testing

1. Run dev server: `npm run dev`
2. Visit homepage: `http://localhost:3000`
3. Click "Register Now" if not registered
4. Test with Shopify test order

## Production

Update `NEXT_PUBLIC_APP_URL` to your production URL before deploying.

## License

MIT
