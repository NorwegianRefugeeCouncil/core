import { LoaderFunctionArgs } from 'react-router-dom';

export const createEntityLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<unknown> => {
  return Promise.resolve({});
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