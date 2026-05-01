import React from 'react';

interface CaptchaFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const CaptchaField: React.FC<CaptchaFieldProps> = ({ value, onChange }) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: 0,
        height: 0,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <label htmlFor="url">Leave this field empty</label>
      <input
        id="url"
        type="text"
        name="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        data-testid="captcha-honeypot"
      />
    </div>
  );
};

export default CaptchaField;
