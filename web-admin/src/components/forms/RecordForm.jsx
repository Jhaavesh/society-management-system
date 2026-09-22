import { useState } from 'react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';

export function RecordForm({ fields, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        newErrors[field.name] = \\ is required\;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const error = errors[field.name];
    const value = formData[field.name] || '';

    if (field.type === 'select' && field.options) {
      return (
        <label className='input-wrapper' key={field.name}>
          {field.label}
          <select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value=''>{field.placeholder}</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {error && <span className='input-error'>{error}</span>}
        </label>
      );
    }

    if (field.type === 'textarea') {
      return (
        <label className='input-wrapper' key={field.name}>
          {field.label}
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={3}
          />
          {error && <span className='input-error'>{error}</span>}
        </label>
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        type={field.type}
        value={value}
        onChange={(e) => handleChange(field.name, e.target.value)}
        required={field.required}
        placeholder={field.placeholder}
        error={error}
      />
    );
  };

  return (
    <form className='module-form' onSubmit={handleSubmit}>
      <div className='form-grid'>
        {fields.map(renderField)}
      </div>
      <div className='form-actions'>
        <Button type='button' className='link-button' onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type='submit' className='primary' disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
