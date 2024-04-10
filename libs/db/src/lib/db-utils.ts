const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', ''),
  );
};

const toSnakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

/**
 * Knex post-processes the response from the database by converting the keys to camelCase
 */
export const postProcessResponse = (result: any) => {
  if (Array.isArray(result)) {
    return result.map((row) => {
      const convertedRow: any = {};
      for (const key in row) {
        convertedRow[toCamelCase(key)] = row[key];
      }
      return convertedRow;
    });
  } else if (typeof result === 'object') {
    const convertedResult: any = {};
    for (const key in result) {
      convertedResult[toCamelCase(key)] = result[key];
    }
    return convertedResult;
  }
  return result;
};

/**
 * Convert the keys to snake_case before sending the query to the database
 */
export const wrapIdentifier = (
  value: string,
  origImpl: (value: string) => string,
) => {
  return origImpl(toSnakeCase(value));
};
