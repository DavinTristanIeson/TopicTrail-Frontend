import { Button, type ButtonProps } from '@mantine/core';
import React from 'react';

const PromiseButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & React.ComponentPropsWithoutRef<'button'>
>(function PromiseButton(props, ref) {
  const [loading, setLoading] = React.useState(false);
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
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
    <Button
      ref={ref}
      {...props}
      loading={loading}
      onClick={props.onClick && onClick}
    />
  );
});
export default PromiseButton;
