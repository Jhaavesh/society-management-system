export function Button({ children, className = '', type = 'button', disabled, onClick, ...props }) {
  return (
    <button
      type={type}
      className={'btn ' + className}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
