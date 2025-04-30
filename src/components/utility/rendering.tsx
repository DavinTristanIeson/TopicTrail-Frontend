import React from 'react';
import { Freeze } from 'react-freeze';
import { useInView } from 'react-intersection-observer';

interface FreezeWhenNotVisibleProps {
  containerProps?: React.ComponentProps<'div'>;
  children?: React.ReactNode;
}

export function FreezeWhenNotVisible(props: FreezeWhenNotVisibleProps) {
  const { ref, inView } = useInView({
    delay: 1000,
  });
  return (
    <div ref={ref} {...props.containerProps}>
      <Freeze freeze={!inView}>{props.children}</Freeze>
    </div>
  );
}
