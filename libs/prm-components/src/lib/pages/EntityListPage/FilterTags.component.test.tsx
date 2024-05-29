import { render, fireEvent } from '@testing-library/react';

import { FilterTags } from './FilterTags.component';

const mockDeleteFilter: (filter: string) => void = vi.fn();

describe('FilterTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders a tag per filter', () => {
    const { getByText, getAllByTestId } = render(
      <FilterTags
        filters={{
          firstName: 'John',
          middleName: 'Bob',
        }}
        deleteFilter={mockDeleteFilter}
      />,
    );

    expect(getByText('firstName: John')).toBeTruthy();

    const tags = getAllByTestId('close-button');
    expect(tags.length).toBe(2);
  });

  test('renders dates correctly', () => {
    const date = new Date('2006-01-21');
    const { getByText } = render(
      <FilterTags
        filters={{
          firstName: 'John',
          dateOfBirthMax: date,
        }}
        deleteFilter={mockDeleteFilter}
      />,
    );

    expect(
      getByText(`dateOfBirthMax: ${date.toLocaleDateString()}`),
    ).toBeTruthy();
  });

  test('calls deleteFilter', async () => {
    const date = new Date('2006-01-21');
    const { getByText, getAllByTestId } = render(
      <FilterTags
        filters={{
          firstName: 'John',
          dateOfBirthMax: date,
        }}
        deleteFilter={mockDeleteFilter}
      />,
    );

    expect(
      getByText(`dateOfBirthMax: ${date.toLocaleDateString()}`),
    ).toBeTruthy();
    expect(getByText(`firstName: John`)).toBeTruthy();

    const buttons = getAllByTestId('close-button');
    fireEvent.click(buttons[0]);
    expect(mockDeleteFilter).toHaveBeenCalled();
  });
});
