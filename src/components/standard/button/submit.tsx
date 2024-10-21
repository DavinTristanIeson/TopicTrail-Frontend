import { classNames } from "@/common/utils/styles";
import { useFormContext } from "react-hook-form";
import ButtonStyles from "./button.module.css";
import { Button, ButtonProps } from "@mantine/core";

export default function SubmitButton(props: ButtonProps) {
  const {
    formState: { isSubmitting, isDirty, isValid },
  } = useFormContext();
  return (
    <Button
      {...props}
      type="submit"
      radius="xl"
      loading={isSubmitting}
      disabled={(isDirty && !isValid) || props.disabled}
      className={classNames(
        props.variant === "appeal" ? ButtonStyles["button--submit"] : undefined,
        props.className
      )}
    />
  );
}
