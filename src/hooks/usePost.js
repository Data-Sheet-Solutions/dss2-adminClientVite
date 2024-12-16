import useRequest from './useRequest';
import { useCallback } from 'react';

export const usePost = () => {
  const { sendRequest, response, isLoading, error } = useRequest('post');

  const postData = useCallback(
    async (path, data, options = {}) => {
      return sendRequest(path, data, options);
    },
    [sendRequest]
  );

  return { postData, response, isLoading, error };
};
