import Keycloak from 'keycloak-js';

console.log('[Keycloak] Creating configuration');
const keycloakConfig = {
  url: 'https://sds.zone/auth/',
  realm: 'dss-realm',
  clientId: 'portal-app',
};

console.log('[Keycloak] Initializing Keycloak instance');
const kc = new Keycloak(keycloakConfig);

// Configure token refresh
kc.onTokenExpired = () => {
  console.log('[Keycloak] Token expired, refreshing...');
  kc.updateToken(30).catch((error) => {
    console.error('[Keycloak] Failed to refresh token:', error);
    // Only force re-login if we're really unable to refresh
    if (error.error === 'invalid_grant') {
      console.log('[Keycloak] Invalid grant, forcing re-login');
      kc.login();
    }
  });
};

// Add a min validity check
const MIN_VALIDITY = 30;

// Add a method to ensure token validity before requests
kc.updateTokenIfNeeded = () => {
  console.log('[Keycloak] Checking token validity');
  return new Promise((resolve, reject) => {
    kc.updateToken(MIN_VALIDITY)
      .then((refreshed) => {
        if (refreshed) {
          console.log('[Keycloak] Token was successfully refreshed');
        } else {
          console.log('[Keycloak] Token is still valid');
        }
        resolve(kc.token);
      })
      .catch((error) => {
        console.error('[Keycloak] Failed to refresh token:', error);
        reject(error);
      });
  });
};

console.log('[Keycloak] Exporting Keycloak instance');
export default kc;
