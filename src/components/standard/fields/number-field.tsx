import { NumberInput, NumberInputProps } from "@mantine/core";
import { useController } from "react-hook-form";

interface Props extends NumberInputProps {
  name: string;
}

export default function NumberField(props: Props) {
  const { field, fieldState } = useController({
    name: props.name,
  });

  return (
    <NumberInput
      {...field}
      onChange={(e) => {
        if (e === "") {
          field.onChange(undefined);
        } else {
          field.onChange(e);
        }
      }}
      error={fieldState.error?.message}
      {...props}
    />
  );
}
