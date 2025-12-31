// ==================== FILE: types/button.types.ts ====================
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export type ButtonSize = 'small' | 'medium' | 'large';

export type IconPosition = 'left' | 'right';

export type Direction = 'vertical' | 'horizontal' | 'grid';

export type Gap = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  rounded?: boolean;
  outline?: boolean;
  isActive?: boolean;
  loading?: boolean;
  className?: string;
}

export interface ButtonData {
  id?: string | number;
  label?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
  fullWidth?: boolean;
  rounded?: boolean;
  outline?: boolean;
  disabled?: boolean;
  loading?: boolean;
  value?: any;
  [key: string]: any;
}

export interface ButtonListProps {
  buttons: ButtonData[];
  direction?: Direction;
  gap?: Gap;
  multiSelect?: boolean;
  defaultActive?: number | number[] | null;
  allowDeselect?: boolean;
  onButtonClick?: (button: ButtonData, index: number, isActive: boolean) => void;
  onActiveChange?: (activeIndexes: number[]) => void;
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export interface ButtonGroupProps {
  buttons: ButtonData[];
  attached?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  defaultActive?: number | null;
  allowDeselect?: boolean;
  className?: string;
  onButtonClick?: (button: ButtonData, index: number, isActive: boolean) => void;
  onActiveChange?: (activeIndex: number | null) => void;
}
