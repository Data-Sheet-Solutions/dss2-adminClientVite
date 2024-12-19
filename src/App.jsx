import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import Home from './components/Home';
import { UserProvider } from './context/UserContext';

function App() {
  const [keycloakReady, setKeycloakReady] = useState(false);

  const onKeycloakEvent = (event, error) => {
    console.log('[App] Keycloak event:', event);
    if (event === 'onReady') {
      setKeycloakReady(true);
    }
    if (event === 'onTokenExpired') {
      console.log('[App] Token expired event received');
      keycloak
        .updateTokenIfNeeded()
        .then(() => console.log('[App] Token refreshed after expiry event'))
        .catch((err) => console.error('[App] Failed to refresh token after expiry event:', err));
    }
  };

  const onKeycloakTokens = (tokens) => {
    console.log('[App] Keycloak tokens updated');
  };

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        pkceMethod: 'S256',
        checkLoginIframe: true,
        onLoad: 'login-required',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        enableLogging: true,
        minValidity: 30,
        refreshToken: true,
        checkLoginIframeInterval: 5,
        flow: 'standard',
        responseMode: 'fragment',
        updateMinValidity: 20,
        scope: 'openid profile email',
      }}
      onEvent={onKeycloakEvent}
      onTokens={onKeycloakTokens}
      LoadingComponent={<div>Loading Keycloak...</div>}
    >
      <UserProvider>
        <BrowserRouter basename="/fulfill">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route
              path="/home/*"
              element={
                keycloakReady ? (
                  <Home />
                ) : (
                  <div className="d-flex justify-content-center align-items-center vh-100">
                    <div className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <div className="mt-2">Initializing application...</div>
                    </div>
                  </div>
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ReactKeycloakProvider>
  );
}

export default App;
