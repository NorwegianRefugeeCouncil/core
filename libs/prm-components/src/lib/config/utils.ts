// TODO: Replace when doing translations
const toHumanReadable = (value: string) =>
  value.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const optionsFromEnum = (enumType: Record<string, any>) => ({
  options: Object.values(enumType).map((value) => ({
    value,
    label: toHumanReadable(value),
  })),
});
