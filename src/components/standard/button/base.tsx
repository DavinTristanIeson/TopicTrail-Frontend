import {
  Button as RawButton,
  ButtonProps as RawButtonProps,
} from "@mantine/core";
import React from "react";

export type ButtonProps = RawButtonProps &
  React.ComponentPropsWithoutRef<"button">;

export default function Button(props: ButtonProps) {
  return <RawButton type="button" {...props} />;
}
