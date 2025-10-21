'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<{
    registered: boolean;
    carrier_service?: any;
    error?: string;
    loading: boolean;
  }>({ registered: false, loading: true });

  const [registering, setRegistering] = useState(false);
  const [registerResult, setRegisterResult] = useState<any>(null);
  const [unregistering, setUnregistering] = useState(false);
  const [unregisterResult, setUnregisterResult] = useState<any>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus({ ...data, loading: false });
    } catch (error) {
      setStatus({
        registered: false,
        error: 'Failed to check status',
        loading: false,
      });
    }
  };

  const registerCarrierService = async () => {
    setRegistering(true);
    setRegisterResult(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setRegisterResult({ success: true, data });
        // Refresh status after successful registration
        setTimeout(() => checkStatus(), 1000);
      } else {
        setRegisterResult({ success: false, error: data.error || 'Registration failed' });
      }
    } catch (error: any) {
      setRegisterResult({ success: false, error: error.message });
    } finally {
      setRegistering(false);
    }
  };

  const unregisterCarrierService = async () => {
    if (!status.carrier_service?.id) {
      setUnregisterResult({ success: false, error: 'No carrier service ID found' });
      return;
    }

    if (!confirm('Are you sure you want to unregister the carrier service?')) {
      return;
    }

    setUnregistering(true);
    setUnregisterResult(null);

    try {
      const response = await fetch('/api/unregister', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carrier_service_id: status.carrier_service.id,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setUnregisterResult({ success: true, data });
        // Refresh status after successful unregistration
        setTimeout(() => checkStatus(), 1000);
      } else {
        setUnregisterResult({ success: false, error: data.error || 'Unregistration failed' });
      }
    } catch (error: any) {
      setUnregisterResult({ success: false, error: error.message });
    } finally {
      setUnregistering(false);
    }
  };

  return (
        <div>
          <h1>Shopify Carrier Service</h1>

          {status.loading ? (
            <p>Checking registration status...</p>
          ) : (
            <>
              <h2>Status</h2>
              {status.registered ? (
                <div>
                  <p>✓ Carrier service is REGISTERED</p>
                  {status.carrier_service && (
                    <div>
                      <p>Name: {status.carrier_service.name}</p>
                      <p>ID: {status.carrier_service.id}</p>
                      <p>Callback URL: {status.carrier_service.callback_url}</p>
                    </div>
                  )}
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={unregisterCarrierService}
                      disabled={unregistering}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        cursor: unregistering ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {unregistering ? 'Unregistering...' : 'Unregister Carrier Service'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>✗ Carrier service is NOT registered</p>
                  {status.error && <p>Error: {status.error}</p>}
                </div>
              )}

              {!status.registered && !status.error && (
                <div>
                  <h2>Register Carrier Service</h2>
                  <button onClick={registerCarrierService} disabled={registering}>
                    {registering ? 'Registering...' : 'Register Now'}
                  </button>
                </div>
              )}

              {registerResult && (
                <div>
                  <h2>Registration Result</h2>
                  {registerResult.success ? (
                    <div>
                      <p>✓ Successfully registered!</p>
                      <p>Carrier Service ID: {registerResult.data.carrier_service?.id}</p>
                    </div>
                  ) : (
                    <div>
                      <p>✗ Registration failed</p>
                      <p>Error: {registerResult.error}</p>
                    </div>
                  )}
                </div>
              )}

              {unregisterResult && (
                <div>
                  <h2>Unregistration Result</h2>
                  {unregisterResult.success ? (
                    <div>
                      <p>✓ Successfully unregistered!</p>
                    </div>
                  ) : (
                    <div>
                      <p>✗ Unregistration failed</p>
                      <p>Error: {unregisterResult.error}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h2>API Endpoints</h2>
                <ul>
                  <li>
                    <a href="/api/shipping-rates" target="_blank">
                      /api/shipping-rates
                    </a>{' '}
                    - Shipping rate calculator (POST from Shopify)
                  </li>
                  <li>
                    <a href="/api/status" target="_blank">
                      /api/status
                    </a>{' '}
                    - Check registration status
                  </li>
                </ul>
              </div>

              <div>
                <button onClick={checkStatus}>Refresh Status</button>
              </div>
            </>
          )}
        </div>
  );
}
