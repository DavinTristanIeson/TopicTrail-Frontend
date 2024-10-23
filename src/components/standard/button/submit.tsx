import { classNames } from "@/common/utils/styles";
import { useFormContext } from "react-hook-form";
import { Button, ButtonProps } from "@mantine/core";

export default function SubmitButton(props: ButtonProps) {
  const {
    formState: { isSubmitting, isDirty, isValid },
  } = useFormContext();
  return (
    <Button
      {...props}
      type="submit"
      loading={isSubmitting}
      disabled={(isDirty && !isValid) || props.disabled}
      className={classNames(props.className)}
    />
  );
}
