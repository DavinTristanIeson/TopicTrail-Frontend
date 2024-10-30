import React, { useImperativeHandle } from "react";

export interface ToggleDispatcher {
  open(): void;
  close(): void;
  toggle(): void;
}

export function useSetupToggleDispatcher(ref: React.ForwardedRef<ToggleDispatcher | undefined>){
  const [opened, setOpened] = React.useState(false);
  useImperativeHandle(ref, () => {
    console.log(ref);
    return {
      toggle(){
        setOpened(prev => !prev);
      },
      open(){
        setOpened(true);
      },
      close(){
        setOpened(false);
      }
    } as ToggleDispatcher
  });
  return [opened, setOpened] as const
}
