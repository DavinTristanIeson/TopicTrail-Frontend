import Link, { LinkProps } from "next/link";
import ButtonStyles from "./button.module.css";
import { classNames } from "@/common/utils/styles";

interface TextLinkProps extends LinkProps {
  className?: string;
  style?: React.CSSProperties;
  span?: boolean;
  children?: React.ReactNode;
}

export default function TextLink(props: TextLinkProps) {
  return (
    <Link
      {...props}
      target="_blank"
      className={classNames(
        ButtonStyles["button__link"],
        props.span ? "inline-block" : undefined,
        props.className
      )}
    />
  );
}
