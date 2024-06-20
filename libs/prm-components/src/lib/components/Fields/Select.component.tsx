import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from '@chakra-ui/react';
import { AsyncSelect, Select as S, components } from 'chakra-react-select';
import { useController, useFormContext } from 'react-hook-form';

import { FieldConfig } from '../../config';

// This is to help with performance in large lists
const Option = ({ children, ...props }: any) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return <components.Option {...newProps}>{children}</components.Option>;
};

type Props = {
  config: FieldConfig;
};

export const Select: React.FC<Props> = ({ config }) => {
  const name = config.path.join('.');

  const {
    control,
    formState: { disabled },
  } = useFormContext();
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <FormControl isInvalid={fieldState.invalid} isRequired={config.required}>
      {config.label && <FormLabel>{config.label}</FormLabel>}

      {(config.options?.length ?? 0) > 300 ? (
        <AsyncSelect
          loadOptions={(inputValue) =>
            new Promise((resolve) =>
              resolve(
                config.options
                  ?.filter((option) =>
                    option.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()),
                  )
                  .slice(0, 100) ?? [],
              ),
            )
          }
          value={config.options?.find((option) => option.value === field.value)}
          onChange={(option) => field.onChange(option?.value)}
          isDisabled={disabled}
          isClearable={!config.required}
          placeholder={config.placeholder}
          isSearchable
          menuPortalTarget={document.querySelector('body')}
          noOptionsMessage={({ inputValue }) =>
            inputValue.length > 0 ? 'No results' : 'Type to search'
          }
        />
      ) : (
        <S
          options={config.options}
          value={config.options?.find((option) => option.value === field.value)}
          onChange={(option) => field.onChange(option?.value)}
          isDisabled={disabled}
          isClearable={!config.required}
          placeholder={config.placeholder}
          isSearchable
          menuPortalTarget={document.querySelector('body')}
        />
      )}
      {config.description && (
        <FormHelperText>{config.description}</FormHelperText>
      )}
      {fieldState.error && (
        <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>
      )}
    </FormControl>
  );
};
