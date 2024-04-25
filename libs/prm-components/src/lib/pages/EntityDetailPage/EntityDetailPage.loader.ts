import { EntityType, EntityTypeSchema } from '@nrcno/core-models';
import { LoaderFunctionArgs } from 'react-router-dom';

export type EntityLoaderData = {
  mode: 'create' | 'read';
  entityType: EntityType;
  entityId?: string | undefined;
};

export const createEntityLoader = ({
  params,
}: LoaderFunctionArgs): EntityLoaderData => {
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

export const readEntityLoader = ({
  params,
}: LoaderFunctionArgs): EntityLoaderData => {
  const entityType = EntityTypeSchema.safeParse(params.entityType);

  if (!entityType.success || !params.entityId) {
    throw new Response('', {
      status: 404,
      statusText: 'Not Found',
    });
  }

  return {
    mode: 'read',
    entityType: entityType.data,
    entityId: params.entityId,
  };
};
