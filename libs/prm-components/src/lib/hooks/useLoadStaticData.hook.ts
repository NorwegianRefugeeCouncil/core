import { useEffect } from 'react';
import { EntityType, Language, Nationality } from '@nrcno/core-models';
import { PrmClient } from '@nrcno/core-clients';
import { useApiReducer } from '@nrcno/core-shared-frontend';

export type StaticData = {
  [EntityType.Language]: Language[];
  [EntityType.Nationality]: Nationality[];
};

export const useLoadStaticData = (client: PrmClient) => {
  const [state, actions] = useApiReducer<StaticData>();

  useEffect(() => {
    (async () => {
      try {
        actions.submitting();
        const [languageResult, nationalityResult] = await Promise.all([
          client.languages.list({
            startIndex: 0,
            pageSize: 8000,
          }),
          client.nationalities.list({
            startIndex: 0,
            pageSize: 300,
          }),
        ]);
        actions.success({
          languages: languageResult.items,
          nationalities: nationalityResult.items,
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
