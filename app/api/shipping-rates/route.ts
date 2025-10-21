import { NextRequest, NextResponse } from 'next/server';
import shippingRates from '@/data/shipping-rates.json';

// Insurance options
const INSURANCE_OPTIONS = [
  { name: '', cost: 0, label: '' },
  { name: 'Verzekerd tot €250', cost: 2.50, label: ' + Verzekerd tot €250 (+ €2,50)' },
  { name: 'Verzekerd tot €500', cost: 5.00, label: ' + Verzekerd tot €500 (+ €5,00)' },
  { name: 'Verzekerd tot €1.000', cost: 10.00, label: ' + Verzekerd tot €1.000 (+ €10,00)' },
];

interface ShopifyRateRequest {
  rate: {
    origin: any;
    destination: {
      country: string; // Shopify sends "country" not "country_code"
      country_code?: string; // Optional fallback
      postal_code: string;
      province: string;
      city: string;
      name: string | null;
      address1: string;
      address2: string | null;
      address3: string | null;
      latitude?: number | null;
      longitude?: number | null;
      phone: string | null;
      fax: string | null;
      email: string | null;
      address_type: string | null;
      company_name: string | null;
    };
    items: Array<{
      name: string;
      sku: string;
      quantity: number;
      grams: number;
      price: number;
      vendor: string;
      requires_shipping: boolean;
      taxable: boolean;
      fulfillment_service: string;
      properties: any;
      product_id: number;
      variant_id: number;
    }>;
    currency: string;
    locale: string;
  };
}

interface ShippingRate {
  min_weight: number;
  max_weight: number;
  base_cost: number;
  label: string;
}

interface CountryRates {
  country_name: string;
  non_mailbox: ShippingRate[];
  mailbox: ShippingRate[];
  eu_parcel: ShippingRate[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ShopifyRateRequest = await request.json();
    const { rate } = body;

    // Extract destination info - Shopify sends "country" not "country_code"
    const countryCode = rate.destination.country || rate.destination.country_code;
    const currency = rate.currency || 'EUR';

    // Check if country code is provided
    if (!countryCode) {
      return NextResponse.json({ rates: [] });
    }

    // Calculate total weight in kg
    const totalWeightGrams = rate.items.reduce(
      (sum, item) => sum + (item.grams * item.quantity),
      0
    );
    const totalWeightKg = totalWeightGrams / 1000;

    // Get rates for this country
    const countryRates = (shippingRates as Record<string, CountryRates>)[countryCode];

    if (!countryRates) {
      // No rates for this country, return empty
      return NextResponse.json({ rates: [] });
    }

    const availableRates: any[] = [];

    // Helper function to add rates
    const addRatesForType = (
      rates: ShippingRate[],
      serviceName: string,
      typeDescription: string,
      description: string
    ) => {
      for (const rate of rates) {
        if (totalWeightKg >= rate.min_weight && totalWeightKg <= rate.max_weight) {
          // Add base rate + all insurance variations
          for (const insurance of INSURANCE_OPTIONS) {
            const totalCost = rate.base_cost + insurance.cost;

            // Format service name based on whether there's a type description
            const formattedServiceName = typeDescription
              ? `${serviceName} (${rate.label}, ${typeDescription})`
              : `${serviceName} (${rate.label})`;

            availableRates.push({
              service_name: `${formattedServiceName}${insurance.label}`,
              service_code: `${serviceName.replace(/\s+/g, '_')}_${rate.label.replace(/[–\s]/g, '_')}${typeDescription ? '_' + typeDescription.replace(/\s+/g, '_') : ''}${insurance.name ? '_INS_' + insurance.cost.toString().replace('.', '') : ''}`,
              total_price: Math.round(totalCost * 100).toString(), // Price in cents
              description: description,
              currency: currency,
              min_delivery_date: null,
              max_delivery_date: null,
            });
          }
        }
      }
    };

    // Add non-mailbox rates (0-2kg)
    if (totalWeightKg <= 2.0 && countryRates.non_mailbox) {
      addRatesForType(
        countryRates.non_mailbox,
        'Pakje buitenland',
        'niet door brievenbus',
        'For packages 0–2000 grams that do not fit through the mailbox'
      );
    }

    // Add mailbox rates (0-2kg)
    if (totalWeightKg <= 2.0 && countryRates.mailbox) {
      addRatesForType(
        countryRates.mailbox,
        'Pakje buitenland brievenbuspakje',
        'door brievenbus',
        'For packages 0–2000 grams that fit through the mailbox'
      );
    }

    // Add EU parcel rates (0-31.5kg)
    if (totalWeightKg <= 31.5 && countryRates.eu_parcel) {
      addRatesForType(
        countryRates.eu_parcel,
        'Pakket EU',
        '',
        'For packages 0–31.5 kg within the EU'
      );
    }

    return NextResponse.json({ rates: availableRates });
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    return NextResponse.json({ rates: [] }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'carrier-service',
    timestamp: new Date().toISOString(),
  });
}
