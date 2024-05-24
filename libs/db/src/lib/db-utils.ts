import { camelCase, snakeCase } from 'lodash';

/**
 * Knex post-processes the response from the database by converting the keys to camelCase
 */
export const postProcessResponse = (result: any) => {
  if (Array.isArray(result)) {
    return result.map((row) => {
      const convertedRow: any = {};
      for (const key in row) {
        convertedRow[camelCase(key)] = row[key];
      }
      return convertedRow;
    });
  } else if (typeof result === 'object') {
    const convertedResult: any = {};
    for (const key in result) {
      convertedResult[camelCase(key)] = result[key];
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
  return origImpl(snakeCase(value));
};
