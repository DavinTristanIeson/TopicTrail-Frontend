import {
  MultipleDateTimeField,
  MultipleDateTimeFieldProps,
  MultipleNumberField,
  MultipleNumberFieldProps,
} from './multiple';
import {
  DateTimeField,
  DateTimeFieldProps,
  MultiSelectField,
  MultiSelectFieldProps,
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
  | MultiSelectFieldProps
  | SwitchFieldProps
  | TextareaFieldProps
  | DateTimeFieldProps
  | MultipleNumberFieldProps
  | MultipleDateTimeFieldProps;

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
      case 'multi-select':
      return <MultiSelectField {...props} />;
    case 'textarea':
      return <TextareaField {...props} />;
    case 'datetime':
      return <DateTimeField {...props} />;
    case 'multiple-number':
      return <MultipleNumberField {...props} />;
    case 'multiple-datetime':
      return <MultipleDateTimeField {...props} />;
  }
}
