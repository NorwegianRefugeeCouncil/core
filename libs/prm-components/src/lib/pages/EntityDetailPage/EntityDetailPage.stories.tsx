import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import axios from 'axios';
import { ZodError } from 'zod';
import { EntityType } from '@nrcno/core-models';

import { PrmProvider } from '../../prm.context';

import { EntityDetailPage } from './EntityDetailPage.component';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3333/api',
});
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 400) {
      throw new ZodError(error.response.data);
    }
    throw error;
  },
);

const meta: Meta = {
  component: EntityDetailPage,
  title: 'EntityDetailPage',
  render: ({ entityType, entityId, mode }: any) => (
    <PrmProvider
      axiosInstance={axiosInstance}
      entityType={entityType}
      entityId={entityId}
    >
      <EntityDetailPage mode={mode} />
    </PrmProvider>
  ),
  argTypes: {
    mode: {
      options: ['create', 'read', 'update'],
      control: { type: 'select' },
    },
    entityType: {
      options: Object.values(EntityType),
      control: { type: 'select' },
    },
    entityId: {
      control: { type: 'text' },
    },
  },
};
export default meta;
type Story = StoryObj<typeof EntityDetailPage>;

export const Primary = {
  args: {
    mode: 'create',
    entityType: EntityType.Participant,
    entityId: undefined,
  },
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/EntityDetailPage/gi)).toBeTruthy();
  },
};
