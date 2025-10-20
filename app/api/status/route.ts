import { NextResponse } from 'next/server';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

export async function GET() {
  try {
    if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json({
        registered: false,
        error: 'Shopify credentials not configured',
      });
    }

    const url = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/carrier_services.json`;

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        registered: false,
        error: `Shopify API error: ${response.status}`,
      });
    }

    const data = await response.json();
    const carrierServices = data.carrier_services || [];

    // Check if our carrier service is registered
    const ourService = carrierServices.find((service: any) =>
      service.name === 'Custom Shipping Rates'
    );

    return NextResponse.json({
      registered: !!ourService,
      carrier_service: ourService || null,
      total_services: carrierServices.length,
    });
  } catch (error: any) {
    console.error('Error checking carrier service status:', error);
    return NextResponse.json({
      registered: false,
      error: error.message || 'Internal server error',
    });
  }
}
