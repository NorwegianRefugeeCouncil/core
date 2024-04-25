import * as React from 'react';
import { Entity } from '@nrcno/core-models';

import { usePrmContext } from '../prm.context';
import { config } from '../config';

import { SubmitStatus } from './useApiReducer.hook';

export const useEntityDetailPage = (mode: 'create' | 'read' | 'edit') => {
  const { entityType, entityId, create, read, edit } = usePrmContext();

  React.useEffect(() => {
    if ((mode === 'read' || mode === 'edit') && entityId) {
      read.loadEntity(entityId);
    }
  }, [mode, entityId, read]);

  if (!entityType) {
    throw new Error('Entity type is required');
  }

  if (mode === 'read' && !entityId) {
    throw new Error('Entity ID is required');
  }

  const detailConfig = config[entityType].detail;

  switch (mode) {
    case 'create': {
      const onSubmit = (data: Entity) => {
        create.onCreateEntity(data);
      };

      return {
        onSubmit,
        mode: mode,
        entityType: entityType,
        config: detailConfig,
        isLoading: create.status === SubmitStatus.SUBMITTING,
        isError: create.status === SubmitStatus.ERROR,
        isSuccess: create.status === SubmitStatus.SUCCESS,
        error: create.error,
      };
    }
    case 'read': {
      return {
        mode: mode,
        entityType: entityType,
        config: detailConfig,
        isLoading: read.status === SubmitStatus.SUBMITTING,
        isError: read.status === SubmitStatus.ERROR,
        isSuccess: read.status === SubmitStatus.SUCCESS,
        error: read.error,
        data: read.data,
      };
    }
    case 'edit': {
      const onSubmit = (target: HTMLFormElement) => {
        if (!entityId) throw new Error('Entity ID is required');
        const entity = parseEntityFromForm(detailConfig, target);
        edit.onEditEntity(entityId, entity);
      };

      return {
        onSubmit,
        mode: mode,
        entityType: entityType,
        config: detailConfig,
        isLoading:
          edit.status === SubmitStatus.SUBMITTING ||
          read.status === SubmitStatus.SUBMITTING,
        isError:
          edit.status === SubmitStatus.ERROR ||
          read.status === SubmitStatus.ERROR,
        isSuccess:
          edit.status === SubmitStatus.SUCCESS ||
          read.status === SubmitStatus.SUCCESS,
        error: edit.error || read.error,
        data: edit.data || read.data,
      };
    }
    default:
      throw new Error('Invalid mode');
  }
};
