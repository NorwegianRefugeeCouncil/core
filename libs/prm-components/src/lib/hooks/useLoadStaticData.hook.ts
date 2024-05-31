import { useEffect } from 'react';
import { Language } from '@nrcno/core-models';
import { PrmClient } from '@nrcno/core-clients';

import { useApiReducer } from './useApiReducer.hook';

export type StaticData = {
  languages: Language[];
};

export const useLoadStaticData = (client: PrmClient) => {
  const [state, actions] = useApiReducer<StaticData>();

  useEffect(() => {
    (async () => {
      try {
        actions.submitting();
        const languageResult = await client.languages.list({
          startIndex: 0,
          pageSize: 8000,
        });
        actions.success({
          languages: languageResult.items,
        });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error('An error occurred');
        actions.error(err);
      }
    })();
  }, []);

  return state;
};
