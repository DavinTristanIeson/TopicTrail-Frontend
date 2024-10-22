import { DateTimePicker, DateTimePickerProps } from "@mantine/dates";
import { useController } from "react-hook-form";

interface Props extends DateTimePickerProps {
  name: string;
}

export default function DateTimeField(props: Props) {
  const { field, fieldState } = useController({
    name: props.name,
  });

  return (
    <DateTimePicker {...field} error={fieldState.error?.message} {...props} />
  );
}
