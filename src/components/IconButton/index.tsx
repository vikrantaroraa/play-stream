import { forwardRef, PropsWithChildren, Ref } from "react";
import styles from "./index.module.css";

type IconButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

const Button = (
  { children, onClick, disabled }: PropsWithChildren<IconButtonProps>,
  ref?: Ref<HTMLButtonElement>
) => {
  return (
    <button
      className={styles["button"]}
      onClick={onClick}
      ref={ref}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const IconButton = forwardRef(Button);

export default IconButton;
