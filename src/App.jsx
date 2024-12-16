import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import logo from './assets/logo.png';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import kc from './keycloak';

function LoginScreen() {
  console.log('[LoginScreen] Rendering');
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  useEffect(() => {
    if (keycloak?.authenticated) {
      console.log('[LoginScreen] User is authenticated, navigating to /home');
      navigate('/home');
    }
  }, [keycloak?.authenticated, navigate]);

  const handleLogin = () => {
    console.log('[LoginScreen] Login button clicked');
    keycloak.login();
  };

  return (
    <div
      style={{
        backgroundColor: '#e6f3ff',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <div className="d-flex flex-column align-items-center">
        <img src={logo} alt="DSS Logo" style={{ width: '300px', marginBottom: '2rem' }} />
        <Button variant="primary" size="lg" onClick={handleLogin}>
          Log In
        </Button>
      </div>
    </div>
  );
}

function App() {
  console.log('[App] Component rendering');
  const [keycloakReady, setKeycloakReady] = useState(false);

  useEffect(() => {
    console.log('[App] useEffect - Setting document title');
    document.title = 'DSS Administration';
  }, []);

  const onKeycloakEvent = (event, error) => {
    console.log('[App] Keycloak event:', event, error);
    if (event === 'onReady') {
      console.log('[App] Setting keycloakReady to true');
      setKeycloakReady(true);
    }
  };

  const onKeycloakTokens = (tokens) => {
    console.log('[App] Received Keycloak tokens');
  };

  console.log('[App] Current keycloakReady state:', keycloakReady);

  return (
    <ReactKeycloakProvider
      authClient={kc}
      initOptions={{
        pkceMethod: 'S256',
        checkLoginIframe: false,
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/fulfill/silent-check-sso.html',
        enableLogging: true,
        minValidity: 30,
        refreshToken: true,
        checkLoginIframeInterval: 5,
        flow: 'standard',
        responseMode: 'fragment',
        updateMinValidity: 20,
      }}
      onEvent={(event, error) => {
        console.log('[App] ReactKeycloakProvider event:', event);
        if (event === 'onTokenExpired') {
          console.log('[App] Token expired, attempting refresh');
          kc.updateTokenIfNeeded()
            .then(() => console.log('[App] Token refreshed successfully'))
            .catch((err) => console.error('[App] Token refresh failed:', err));
        }
        onKeycloakEvent(event, error);
      }}
      onTokens={onKeycloakTokens}
      LoadingComponent={<div>Loading Keycloak...</div>}
    >
      {keycloakReady
        ? console.log('[App] Rendering Router') || (
            <Router basename="/fulfill">
              <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route
                  path="/home"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Router>
          )
        : console.log('[App] Showing loading state') || <div>Loading Keycloak...</div>}
    </ReactKeycloakProvider>
  );
}

export default App;
