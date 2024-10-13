import { CSSProperties, forwardRef, PropsWithChildren, Ref } from "react";
import styles from "./index.module.css";

type IconButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  style?: CSSProperties;
};

const Button = (
  { children, onClick, disabled, style }: PropsWithChildren<IconButtonProps>,
  ref?: Ref<HTMLButtonElement>
) => {
  return (
    <button
      className={styles["button"]}
      onClick={onClick}
      ref={ref}
      disabled={disabled}
      style={{ ...style }}
    >
      {children}
    </button>
  );
};

const IconButton = forwardRef(Button);

export default IconButton;
