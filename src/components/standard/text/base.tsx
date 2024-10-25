import { Text as RawText, TextProps as RawTextProps } from "@mantine/core";
import { ReactNode, forwardRef } from "react";
import { TypographyVariants } from "./variants";
import Colors from "@/common/constants/colors";
import { classNames } from "@/common/utils/styles";

export interface TextProps extends RawTextProps {
  wrap?: boolean;

  isResponsive?: boolean;
  children?: ReactNode;
}

const Text = forwardRef<HTMLDivElement, TextProps>((props, ref) => {
  const {
    className,
    style,
    wrap = true,
    isResponsive = false,
    ...rest
  } = props;

  return (
    <RawText
      {...rest}
      ref={ref}
      className={classNames(wrap ? "text-wrap" : "text-nowrap", className)}
    />
  );
});

Text.displayName = "Text";

export default Text;
