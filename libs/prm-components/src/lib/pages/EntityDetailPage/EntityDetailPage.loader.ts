import { EntityType, EntityTypeSchema } from '@nrcno/core-models';
import { LoaderFunctionArgs } from 'react-router-dom';

export type CreateEntityLoaderData = {
  mode: 'create';
  entityType: EntityType;
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

  return {
    mode: 'create',
    entityType: entityType.data,
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
