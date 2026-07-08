'use client';

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  className: string;
  message: string;
};

/** Submit button that asks before sending destructive form actions. */
export function ConfirmSubmitButton({
  children,
  className,
  message,
}: ConfirmSubmitButtonProps): React.JSX.Element {
  return (
    <button
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {children}
    </button>
  );
}
