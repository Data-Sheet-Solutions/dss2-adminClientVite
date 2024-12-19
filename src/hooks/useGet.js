import useRequest from './useRequest';
import { useCallback } from 'react';

export const useGet = () => {
  const { sendRequest, response, isLoading, error } = useRequest('get');

  const getData = useCallback(
    async (path, params = {}, options = {}) => {
      // For binary data, set appropriate headers
      if (options.responseType === 'arraybuffer') {
        options.headers = {
          ...options.headers,
          Accept: 'application/pdf',
          'Content-Type': 'application/pdf',
        };
      }

      return sendRequest(path, params, options);
    },
    [sendRequest]
  );

  return { getData, response, isLoading, error };
};
