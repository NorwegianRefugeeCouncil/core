import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

import { EntityDetailPage } from './EntityDetailPage.component';

const meta: Meta<typeof EntityDetailPage> = {
  component: EntityDetailPage,
  title: 'EntityDetailPage',
};
export default meta;
type Story = StoryObj<typeof EntityDetailPage>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/EntityDetailPage/gi)).toBeTruthy();
  },
};
