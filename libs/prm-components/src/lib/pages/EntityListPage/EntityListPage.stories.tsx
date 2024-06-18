import { EntityType } from '@nrcno/core-models';
import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import axios from 'axios';
import { ZodError } from 'zod';

import { PrmProvider } from '../../prm.context';

import { EntityListPage } from './EntityListPage.component';

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
  component: EntityListPage,
  title: 'EntityListPage',
  render: ({ entityType, entityId }: any) => (
    <PrmProvider
      axiosInstance={axiosInstance}
      entityType={entityType}
      entityId={entityId}
    >
      <EntityListPage />
    </PrmProvider>
  ),
  argTypes: {
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
type Story = StoryObj<typeof EntityListPage>;

export const Primary = {
  args: {
    entityType: EntityType.Individual,
    entityId: undefined,
  },
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/EntityListPage/gi)).toBeTruthy();
  },
};
