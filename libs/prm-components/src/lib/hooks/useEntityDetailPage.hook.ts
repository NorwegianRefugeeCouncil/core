import * as React from 'react';
import { Entity } from '@nrcno/core-models';
import { useNavigate } from 'react-router-dom';

import { usePrmContext } from '../prm.context';
import { config } from '../config';

import { SubmitStatus } from './useApiReducer.hook';

export const useEntityDetailPage = (mode: 'create' | 'read' | 'edit') => {
  const navigate = useNavigate();

  const { entityType, entityId, create, read, edit } = usePrmContext();

  // Load entity when in read or edit mode
  React.useEffect(() => {
    if ((mode === 'read' || mode === 'edit') && entityId) {
      read.loadEntity(entityId);
    }
  }, [mode, entityId]);

  // Reset form when switching between create and edit mode
  React.useEffect(() => {
    if (mode === 'edit' || mode === 'create') {
      create.reset();
      edit.reset();
    }
  }, [mode]);

  if (!entityType) {
    throw new Error('Entity type is required');
  }

  if (mode === 'read' && !entityId) {
    throw new Error('Entity ID is required');
  }

  const detailConfig = config[entityType].detail;

  switch (mode) {
    case 'create': {
      const onSubmit = async (data: Entity) => {
        try {
          await create.onCreateEntity(data);
          navigate(`/prm/${entityType}?success=saved`);
        } catch {
          // Do nothing - error handled via state
        }
      };

      return {
        onSubmit,
        mode,
        entityType,
        config: detailConfig,
        data: create.data,
        isSubmitting: create.status === SubmitStatus.SUBMITTING,
        isLoading: false,
        isError: create.status === SubmitStatus.ERROR,
        isSuccess: create.status === SubmitStatus.SUCCESS,
        error: create.error,
      };
    }
    case 'read': {
      return {
        mode: mode,
        entityType,
        entityId,
        config: detailConfig,
        isSubmitting: false,
        isLoading: read.status === SubmitStatus.SUBMITTING,
        isError: read.status === SubmitStatus.ERROR,
        isSuccess:
          create.status === SubmitStatus.SUCCESS ||
          edit.status === SubmitStatus.SUCCESS,
        error: read.error,
        data: read.data,
      };
    }
    case 'edit': {
      const onSubmit = async (data: Entity) => {
        if (!entityId) throw new Error('Entity ID is required');

        try {
          await edit.onEditEntity(entityId, data);
          navigate(`/prm/${entityType}/${entityId}`);
        } catch {
          // Do nothing - error handled via state
        }
      };

      return {
        onSubmit,
        entityId,
        mode,
        entityType,
        config: detailConfig,
        isSubmitting: edit.status === SubmitStatus.SUBMITTING,
        isLoading: read.status === SubmitStatus.SUBMITTING,
        isError:
          edit.status === SubmitStatus.ERROR ||
          read.status === SubmitStatus.ERROR,
        isSuccess: edit.status === SubmitStatus.SUCCESS,
        error: edit.error || read.error,
        data: edit.data || read.data,
      };
    }
    default:
      throw new Error('Invalid mode');
  }
};
