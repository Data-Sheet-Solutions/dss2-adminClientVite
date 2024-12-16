import useRequest from './useRequest';
import { useCallback } from 'react';

export const usePatch = () => {
  const { sendRequest, response, isLoading, error } = useRequest('patch');

  const patchData = useCallback(
    async (path, data, options = {}) => {
      return sendRequest(path, data, options);
    },
    [sendRequest]
  );

  return { patchData, response, isLoading, error };
};
