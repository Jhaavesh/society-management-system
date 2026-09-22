export function Input({ label, type = 'text', value, onChange, required, placeholder = '', autoComplete, ...props }) {
  return (
    <label className="input-wrapper">
      {label}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...props}
      />
    </label>
  );
}
