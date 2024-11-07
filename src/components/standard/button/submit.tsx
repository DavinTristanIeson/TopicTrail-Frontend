import { classNames } from "@/common/utils/styles";
import { useFormContext } from "react-hook-form";
import { Button, ButtonProps, Tooltip } from "@mantine/core";
import Colors from "@/common/constants/colors";
import { getAnyError } from "@/common/utils/error";

export default function SubmitButton(props: ButtonProps) {
  const {
    formState: { isSubmitting, isValid, isSubmitted, errors },
  } = useFormContext();

  const isError = isSubmitted && !isValid;

  return (
    <Tooltip
      label={`There's an error in this form: ${getAnyError(errors)?.message}`}
      disabled={!isError}
      color={Colors.sentimentError}
    >
      <Button
        {...props}
        type="submit"
        loading={isSubmitting}
        disabled={props.disabled || isError}
        className={classNames(props.className)}
      />
    </Tooltip>
  );
}
