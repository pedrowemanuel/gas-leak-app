import { type ComponentProps } from "react";
import { Text as TextUI } from "react-native";

type Props = ComponentProps<typeof TextUI>;

export function Text({ children, ...rest }: Props) {
  return (
    <TextUI
      style={{ fontSize: 18, fontWeight: "semibold", textAlign: "center" }}
      {...rest}
    >
      {children}
    </TextUI>
  );
}
