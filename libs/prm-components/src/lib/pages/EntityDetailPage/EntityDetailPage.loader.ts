import { EntityType, EntityTypeSchema } from '@nrcno/core-models';
import { LoaderFunctionArgs } from 'react-router-dom';

import { EntityUIConfig, config } from '../../config';

export type CreateEntityLoaderData = {
  entityType: EntityType;
  config: EntityUIConfig['detail'];
};

export const createEntityLoader = ({
  params,
}: LoaderFunctionArgs): CreateEntityLoaderData => {
  const entityType = EntityTypeSchema.safeParse(params.entityType);

  if (!entityType.success) {
    throw new Response('', {
      status: 404,
      statusText: 'Not Found',
    });
  }

  const entityUIConfig = config[entityType.data].detail;

  return {
    entityType: entityType.data,
    config: entityUIConfig,
  };
};

export const editEntityLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<unknown> => {
  return Promise.resolve({});
};

export const readEntityLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<unknown> => {
  return Promise.resolve({});
};
