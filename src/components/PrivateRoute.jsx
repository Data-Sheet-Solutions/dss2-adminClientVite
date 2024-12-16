import { Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const PrivateRoute = ({ children }) => {
  console.log('[PrivateRoute] Rendering');
  const { keycloak } = useKeycloak();

  console.log('[PrivateRoute] Authentication state:', {
    authenticated: keycloak?.authenticated,
    token: keycloak?.token ? 'present' : 'missing',
    tokenParsed: keycloak?.tokenParsed,
    roles: keycloak?.tokenParsed?.realm_access?.roles || [],
  });

  const isAuthorized = () => {
    console.log('[PrivateRoute] Checking authorization');
    if (keycloak?.authenticated && keycloak?.tokenParsed) {
      const roles = keycloak.tokenParsed.realm_access?.roles || [];
      const hasRole = roles.includes('fulfillment');
      console.log('[PrivateRoute] Roles:', roles);
      console.log('[PrivateRoute] Has fulfillment role:', hasRole);
      return hasRole;
    }
    console.log('[PrivateRoute] No token or token not parsed');
    return false;
  };

  if (!keycloak?.authenticated) {
    console.log('[PrivateRoute] Not authenticated, redirecting to login');
    return <Navigate to="/" replace />;
  }

  const authorized = isAuthorized();
  if (!authorized) {
    console.log('[PrivateRoute] Not authorized');
    return <div>You are not authorized to access this page.</div>;
  }

  console.log('[PrivateRoute] Authorized, rendering children');
  return children;
};

export default PrivateRoute;
