import { postProcessResponse, wrapIdentifier } from './db-utils';

describe('db utils', () => {
  describe('postProcessResponse', () => {
    test('should convert snake_case keys to camelCase for an object', () => {
      const result = postProcessResponse({
        snake_case: 'value',
        single: 'single_value',
      });

      expect(result).toEqual({
        snakeCase: 'value',
        single: 'single_value',
      });
    });

    test('should convert snake_case keys to camelCase for an array', () => {
      const result = postProcessResponse([
        {
          snake_case: 'value',
          single: 'single_value',
        },
      ]);

      expect(result).toEqual([
        {
          snakeCase: 'value',
          single: 'single_value',
        },
      ]);
    });

    test('should return the result if it is not an object or array', () => {
      const result = postProcessResponse('string');
      expect(result).toBe('string');
    });
  });

  describe('wrapIdentifier', () => {
    test('should wrap identifier with snake_case', () => {
      const origImpl = (value: string) => value.toUpperCase();
      const result = wrapIdentifier('my_identifier', origImpl);
      expect(result).toBe('MY_IDENTIFIER');
    });

    test('should wrap identifier with camelCase', () => {
      const origImpl = (value: string) => value.toLowerCase();
      const result = wrapIdentifier('myIdentifier', origImpl);
      expect(result).toBe('my_identifier');
    });

    test('should wrap identifier with single word', () => {
      const origImpl = (value: string) => value;
      const result = wrapIdentifier('word', origImpl);
      expect(result).toBe('word');
    });
  });
});
