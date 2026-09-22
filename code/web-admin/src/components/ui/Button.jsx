export function Button({ children, className = '', type = 'button', disabled, onClick, ...props }) {
  return (
    <button
      type={type}
      className={\tn \\}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
