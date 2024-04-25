import { Field as FieldType } from '../../config';

type Props = {
  field: FieldType;
};

export const ReadOnly: React.FC<Props> = ({ field }) => <div>ReadOnly</div>;
