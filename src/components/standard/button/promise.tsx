import React from "react";
import Button, { ButtonProps } from "./base";

export default function PromiseButton(props: ButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const onClick: ButtonProps["onClick"] = (e) => {
    setLoading(true);
    try {
      props.onClick?.(e);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  return (
    <Button {...props} loading={loading} onClick={props.onClick && onClick} />
  );
}
