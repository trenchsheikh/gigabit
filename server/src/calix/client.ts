import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Token Cache Structure
type CalixTokenCache = {
  accessToken: string | null;
  refreshToken: string | null;
  expiryTimeMs: number | null;
};

// Module-level cache
let tokenCache: CalixTokenCache = {
  accessToken: null,
  refreshToken: null,
  expiryTimeMs: null,
};

// Helper to build auth payload
function buildAuthPayload() {
  return {
    client_id: process.env.CALIX_CLIENT_ID,
    client_secret: process.env.CALIX_CLIENT_SECRET,
    username: process.env.CALIX_USERNAME,
    password: process.env.CALIX_PASSWORD,
    tenant: process.env.CALIX_TENANT, // Optional, but included if present
    grant_type: 'password', // Assuming password grant as per user instructions
  };
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Check cache (buffer of 60s)
  if (
    tokenCache.accessToken &&
    tokenCache.expiryTimeMs &&
    now < tokenCache.expiryTimeMs - 1799
  ) {
    return tokenCache.accessToken;
  }

  const authUrl = process.env.CALIX_AUTH_URL;
  if (!authUrl) {
    throw new Error('CALIX_AUTH_URL is not configured');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Calix Auth] Requesting token from: ${authUrl} (POST)`);
  }

  try {
    // 1. Try Refresh Token if available
    if (tokenCache.refreshToken) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Calix Auth] Attempting token refresh...`);
        }
        
        const refreshParams = new URLSearchParams();
        refreshParams.append('grant_type', 'refresh_token');
        refreshParams.append('refresh_token', tokenCache.refreshToken);
        refreshParams.append('client_secret', process.env.CALIX_CLIENT_SECRET || '');

        const refreshResponse = await axios.post(authUrl, refreshParams, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Calix-ClientID': process.env.CALIX_CLIENT_ID || '',
            'Accept': 'application/json',
          },
        });

        const { access_token, refresh_token, expires_in, access_token_expiry_millis } = refreshResponse.data;
        
        if (access_token) {
           // Calculate expiry
          let expiryTimeMs: number;
          if (access_token_expiry_millis) {
            expiryTimeMs = Number(access_token_expiry_millis);
          } else if (expires_in) {
            expiryTimeMs = Date.now() + (Number(expires_in) * 1000);
          } else {
            expiryTimeMs = Date.now() + 3600 * 1000;
          }

          tokenCache = {
            accessToken: access_token,
            refreshToken: refresh_token || tokenCache.refreshToken, // Keep old if not rotated
            expiryTimeMs,
          };

          if (process.env.NODE_ENV === 'development') {
             console.log(`[Calix Auth] Token refreshed. Expires in: ${expires_in}s`);
          }
          return access_token;
        }
      } catch (refreshError: any) {
        console.warn('[Calix Auth] Refresh failed, falling back to password grant:', refreshError.message);
        // Fall through to password grant
      }
    }

    // 2. Initial Password Grant
    const payload = buildAuthPayload();
    
    // Validate required fields
    if (!payload.client_id || !payload.username || !payload.password) {
      throw new Error('Missing required auth credentials (CALIX_CLIENT_ID, CALIX_USERNAME, CALIX_PASSWORD)');
    }

    // Convert to URLSearchParams for x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', payload.client_id || '');
    params.append('client_secret', payload.client_secret || '');
    params.append('username', payload.username || '');
    params.append('password', payload.password || '');
    if (payload.tenant) {
        params.append('tenant', payload.tenant);
    }

    const response = await axios.post(authUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Calix-ClientID': process.env.CALIX_CLIENT_ID || '',
        'Accept': 'application/json',
      },
    });

    const { access_token, refresh_token, expires_in, access_token_expiry_millis } = response.data;

    if (!access_token) {
      throw new Error('No access_token received from Calix');
    }

    // Calculate expiry
    let expiryTimeMs: number;
    if (access_token_expiry_millis) {
      expiryTimeMs = Number(access_token_expiry_millis);
    } else if (expires_in) {
      expiryTimeMs = Date.now() + (Number(expires_in) * 1000);
    } else {
      // Default to 1 hour if unknown
      expiryTimeMs = Date.now() + 1800 * 1000;
    }

    // Update cache
    tokenCache = {
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiryTimeMs,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Calix Auth] Token obtained. Expires in: ${expires_in}s`);
    }

    return access_token;
  } catch (error: any) {
    // Handle Calix Faults
    if (error.response?.data?.fault) {
      const fault = error.response.data.fault;
      const errorMsg = `Calix Auth Fault: ${fault.faultstring} (${fault.detail?.errorcode})`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.error('[Calix Auth] Failed:', error.response?.data || error.message);
    throw new Error(`Calix authentication failed: ${JSON.stringify(error.response?.data || error.message)}`);
  }
}

export async function callCalixServiceInsights<T>(
  path: string,
  options: { params?: Record<string, string | number>; method?: 'GET' | 'POST' } = {}
): Promise<T> {
  const baseUrl = process.env.CALIX_BASE_URL;
  if (!baseUrl) {
    throw new Error('CALIX_BASE_URL is not configured');
  }

  const token = await getAccessToken();
  const clientId = process.env.CALIX_CLIENT_ID;

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;
  const method = options.method || 'GET';

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Calix API] ${method} ${url}`);
  }

  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`, // Some APIs use Bearer
        'X-Calix-ClientID': clientId,     // Explicit header as requested
        'X-Calix-AccessToken': token,     // Explicit header as requested
        'Content-Type': 'application/json',
      },
      params: options.params,
    });

    return response.data;
  } catch (error: any) {
    console.error(`[Calix API] Request failed for ${path}:`, error.response?.data || error.message);
    throw new Error(`Calix request failed: ${JSON.stringify(error.response?.data || error.message)}`);
  }
}
