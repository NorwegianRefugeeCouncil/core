// TODO: Replace when doing translations
const toHumanReadable = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const optionsFromEnum = (enumType: Record<string, any>) =>
  Object.values(enumType).map((value) => ({
    value,
    label: toHumanReadable(value),
  }));
