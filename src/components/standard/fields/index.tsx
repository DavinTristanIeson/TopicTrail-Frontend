import {
  NumberField,
  NumberFieldProps,
  PercentageField,
  PercentageFieldProps,
  SelectField,
  SelectFieldProps,
  SwitchField,
  SwitchFieldProps,
  TagsField,
  TagsFieldProps,
  TextareaField,
  TextareaFieldProps,
  TextField,
  TextFieldProps,
} from './wrapper';

type RHFFieldProps =
  | TextFieldProps
  | NumberFieldProps
  | PercentageFieldProps
  | TagsFieldProps
  | SelectFieldProps
  | SwitchFieldProps
  | TextareaFieldProps;

export default function RHFField(props: RHFFieldProps) {
  switch (props.type) {
    case 'text':
      return <TextField {...props} />;
    case 'number':
      return <NumberField {...props} />;
    case 'percentage':
      return <PercentageField {...props} />;
    case 'tags':
      return <TagsField {...props} />;
    case 'switch':
      return <SwitchField {...props} />;
    case 'select':
      return <SelectField {...props} />;
    case 'textarea':
      return <TextareaField {...props} />;
  }
}
