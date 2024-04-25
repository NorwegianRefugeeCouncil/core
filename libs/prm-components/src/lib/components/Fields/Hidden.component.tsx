import { Field as FieldType } from '../../config';

type Props = {
  field: FieldType;
};

export const Hidden: React.FC<Props> = ({ field }) => <div>Hidden</div>;
