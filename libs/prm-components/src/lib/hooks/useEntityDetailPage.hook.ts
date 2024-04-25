import * as React from 'react';
import { useLoaderData } from 'react-router-dom';
import { z } from 'zod';

import { EntityLoaderData } from '../pages';
import { usePrmContext } from '../prm.context';
import { Component, EntityUIConfig, config } from '../config';
import { SubmitStatus } from '../types';

const applyValue = (path: string[], value: any, obj: any): any => {
  // This works for our current use case, but it's not a general solution
  if (Array.isArray(obj) && z.coerce.number().safeParse(path[0]).success) {
    const idx = Number(path[0]);
    if (idx >= obj.length) {
      return [...obj, applyValue(path.slice(1), value, {})];
    }
    return obj.map((item, index) =>
      index === Number(path[0]) ? applyValue(path.slice(1), value, item) : item,
    );
  }

  if (path.length === 1) {
    return {
      ...obj,
      [path[0]]: value,
    };
  }
  return {
    ...obj,
    [path[0]]: applyValue(path.slice(1), value, obj[path[0]] || {}),
  };
};

const parseEntityFromForm = (
  config: EntityUIConfig['detail'],
  target: HTMLFormElement,
) => {
  const fields = config.sections.flatMap((section) => section.fields);
  const data: any = new FormData(target);
  const entity = fields.reduce((acc, field) => {
    if (field.component === Component.List) {
      const keys = (Array.from(data.keys()) as string[]).filter((key) =>
        key.startsWith(field.path.join('.')),
      );

      if (keys.length === 0) {
        return acc;
      }

      const list = keys.reduce((listAcc, key) => {
        const [_, index, path] = key.split('.');
        const value = data.get(key);
        return applyValue([index, path], value, listAcc);
      }, []);

      return applyValue(field.path, list, acc);
    }

    if (!data.has(field.path.join('.'))) {
      return acc;
    }

    const value = data.get(field.path.join('.'));

    return applyValue(field.path, value, acc);
  }, {});
  return entity;
};

// TODO: Refactor after react-hook-form is integrated
export const useEntityDetailPage = () => {
  const { mode, entityType, entityId } = useLoaderData() as EntityLoaderData;

  const prmContext = usePrmContext();

  const detailConfig = config[entityType].detail;

  const { loadEntity } = prmContext.read;

  React.useEffect(() => {
    if (mode === 'read' && entityId) {
      loadEntity(entityId);
    }
  }, [mode, entityId, loadEntity]);

  switch (mode) {
    case 'create': {
      const onSubmit = (target: HTMLFormElement) => {
        const entityDefinition = parseEntityFromForm(detailConfig, target);
        prmContext.create.onCreateEntity(entityDefinition);
      };

      return {
        onSubmit,
        mode: mode,
        entityType: entityType,
        config: detailConfig,
        isLoading: prmContext.create.status === SubmitStatus.SUBMITTING,
        isError: prmContext.create.status === SubmitStatus.ERROR,
        isSuccess: prmContext.create.status === SubmitStatus.SUCCESS,
        error: prmContext.create.error,
      };
    }
    case 'read': {
      return {
        mode: mode,
        entityType: entityType,
        config: detailConfig,
        isLoading: prmContext.read.status === SubmitStatus.SUBMITTING,
        isError: prmContext.read.status === SubmitStatus.ERROR,
        isSuccess: prmContext.read.status === SubmitStatus.SUCCESS,
        error: prmContext.read.error,
        data: prmContext.read.data,
      };
    }
    default:
      throw new Error('Invalid mode');
  }
};
