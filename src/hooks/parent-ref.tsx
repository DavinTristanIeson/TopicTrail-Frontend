import React from "react";

interface UseIsMountedProps {
  rerenderOnMount?: boolean;
}
export function useIsMounted(props: UseIsMountedProps) {
  const isMounted = React.useRef(false);
  const [, setMounted] = React.useState(false);
  React.useEffect(() => {
    isMounted.current = true;
    if (props.rerenderOnMount) {
      setMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isMounted.current;
}

export enum ParentRefType {
  Loading = "loading",
  Scroll = "scroll",
}

type ParentRefContextType = Partial<
  Record<ParentRefType, React.MutableRefObject<HTMLElement | null>>
>;
const ParentRefContext = React.createContext<ParentRefContextType>({});

export function ParentRefProvider(props: { children?: React.ReactNode }) {
  const loadingRef = React.useRef<HTMLElement | null>(null);
  const scrollRef = React.useRef<HTMLElement | null>(null);

  return (
    <ParentRefContext.Provider
      value={{
        [ParentRefType.Loading]: loadingRef,
        [ParentRefType.Scroll]: scrollRef,
      }}
    >
      {props.children}
    </ParentRefContext.Provider>
  );
}

export default function useGetParentRef(
  type: ParentRefType
): React.MutableRefObject<HTMLElement | null> {
  const empty = React.useRef(null);
  return React.useContext(ParentRefContext)[type] ?? empty;
}
