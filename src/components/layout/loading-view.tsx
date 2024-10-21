import colors from "@/common/constants/colors";
import { Flex, Loader } from "@mantine/core";
import useGetParentRef, {
  ParentRefType,
  useIsMounted,
} from "@/hooks/parent-ref";
import * as React from "react";
import { createPortal } from "react-dom";
import LayoutStyles from "./layout.module.css";

export interface LoadingViewComponentProps {
  children?: React.ReactNode;
  /** Don't render in portal */
  fixed?: boolean;
}

export default function LoadingViewComponent(props: LoadingViewComponentProps) {
  const { children, fixed } = props;

  const portal = useGetParentRef(ParentRefType.Loading);
  const isMounted = useIsMounted({
    rerenderOnMount: true,
  });
  const renderInPortal = portal && portal.current && !fixed;

  const element = (
    <Flex
      justify="center"
      direction="column"
      align="center"
      w="100%"
      h="100%"
      className={LayoutStyles["loading__root"]}
    >
      {children ?? (
        <div>
          <Loader size={40} c={colors.text} />
        </div>
      )}
    </Flex>
  );

  if (!isMounted) return null;

  if (renderInPortal && portal.current) {
    return createPortal(element, portal.current);
  } else {
    return element;
  }
}
