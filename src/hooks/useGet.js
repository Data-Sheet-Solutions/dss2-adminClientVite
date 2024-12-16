import useRequest from './useRequest';
import { useCallback } from 'react';

export const useGet = () => {
  const { sendRequest, response, isLoading, error } = useRequest('get');

  const getData = useCallback(
    async (path, params = {}, options = {}) => {
      return sendRequest(path, params, options);
    },
    [sendRequest]
  );

  return { getData, response, isLoading, error };
};
