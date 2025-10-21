import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION;

export async function DELETE(request: NextRequest) {
  try {
    if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured' },
        { status: 500 }
      );
    }

    // Get the carrier service ID from the request body
    const body = await request.json();
    const carrierId = body.carrier_service_id;

    if (!carrierId) {
      return NextResponse.json(
        { error: 'Carrier service ID is required' },
        { status: 400 }
      );
    }

    const url = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/carrier_services/${carrierId}.json`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      },
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Carrier service unregistered successfully',
      });
    } else {
      const data = await response.json();

      // Format Shopify errors into a readable string
      let errorMessage = 'Failed to unregister carrier service';

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
    console.error('Error unregistering carrier service:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
