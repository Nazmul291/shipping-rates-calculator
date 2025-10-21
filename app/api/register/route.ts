import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(request: NextRequest) {
  try {
    if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured' },
        { status: 500 }
      );
    }

    const url = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/carrier_services.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        carrier_service: {
          name: 'Shipping Rates Calculator',
          callback_url: `${APP_URL}/api/shipping-rates`,
          service_discovery: true,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        carrier_service: data.carrier_service,
      });
    } else {
      // Format Shopify errors into a readable string
      let errorMessage = 'Failed to register carrier service';

      if (data.errors) {
        if (typeof data.errors === 'string') {
          errorMessage = data.errors;
        } else if (typeof data.errors === 'object') {
          // Shopify errors come as objects like { base: ["error1", "error2"] }
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
              return field === 'base' ? msgs : `${field}: ${msgs}`;
            })
            .join('; ');
          errorMessage = errorMessages || errorMessage;
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Error registering carrier service:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
