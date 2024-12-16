import { useState, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';

const useRequest = (method = 'get') => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { keycloak } = useKeycloak();

  const createRequestConfig = (path, data, options = {}, token = null) => {
    const config = {
      method,
      url: `${import.meta.env.VITE_API_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (data) {
      if (method.toLowerCase() === 'get') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    return config;
  };

  const sendRequest = useCallback(
    async (path, data, options = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        if (keycloak?.authenticated) {
          await keycloak.updateToken(30);
        }

        const config = createRequestConfig(path, data, options, keycloak?.authenticated ? keycloak.token : null);

        const result = await axios(config);
        setResponse(result.data);
        return result.data;
      } catch (error) {
        if ((error.response?.status === 401 || error.response?.status === 403) && keycloak?.authenticated) {
          try {
            await keycloak.updateToken(30);
            const retryConfig = createRequestConfig(path, data, options, keycloak.token);
            const retryResult = await axios(retryConfig);
            setResponse(retryResult.data);
            return retryResult.data;
          } catch (retryError) {
            keycloak.login();
            setError(retryError);
            throw retryError;
          }
        }
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [keycloak, method]
  );

  return { sendRequest, response, isLoading, error };
};

export default useRequest;
