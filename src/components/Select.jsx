import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ReactSelect from 'react-select';

const Select = forwardRef(({ options, value, onChange, isMulti = false, isSearchable = true, placeholder = 'Select...', className, highlighted = false, ...props }, ref) => {
  const reactSelectRef = useRef(null);
  const [programmaticOpen, setProgrammaticOpen] = useState(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      reactSelectRef.current?.focus();
      setProgrammaticOpen(true);
    },
    scrollIntoView: (args) => {
      const inputEl = reactSelectRef.current?.inputRef;
      if (inputEl && typeof inputEl.scrollIntoView === 'function') {
        inputEl.scrollIntoView(args);
      }
    },
  }));
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 'auto',
      padding: '0',
      borderWidth: '1px',
      borderColor: highlighted ? '#22c55e' : state.isFocused ? 'var(--primary-color)' : '#d1d5db',
      borderRadius: '0.375rem',
      boxShadow: highlighted ? '0 0 0 2px #22c55e' : 'none',
      '&:hover': {
        borderColor: highlighted ? '#22c55e' : state.isFocused ? 'var(--primary-color)' : '#d1d5db',
      },
      cursor: 'pointer',
      backgroundColor: state.isDisabled ? '#f3f4f6' : '#fff',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '10px 24px',
      textDecortation: 'capitalize',
    }),
    input: (base) => ({
      ...base,
      margin: '0',
      padding: '0',
      color: '#4b5563',
      fontSize: '0.875rem',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '0.875rem',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1f2937',
      fontSize: '0.875rem',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'var(--accent-color)',
      borderRadius: '9999px',
      padding: '0 4px',
      border: '1px solid rgba(0, 116, 86, 0.2)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'var(--primary-color)',
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '2px 6px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'var(--primary-color)',
      '&:hover': {
        backgroundColor: 'transparent',
        color: '#dc2626',
      },
    }),
    menu: (base) => ({
      ...base,
      marginTop: '4px',
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      zIndex: 999,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '240px',
      padding: '0',
    }),
    option: (base, state) => ({
      ...base,
      padding: '10px 16px',
      fontSize: '0.875rem',
      color: state.isSelected ? 'var(--primary-color)' : '#374151',
      backgroundColor: state.isSelected || state.isFocused ? 'var(--accent-color)' : 'transparent',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'var(--accent-color)',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      padding: '10px 12px',
      '&:hover': {
        color: '#6b7280',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#9ca3af',
      padding: '10px 8px',
      '&:hover': {
        color: '#6b7280',
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '0.875rem',
      padding: '12px 16px',
    }),
    loadingMessage: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '0.875rem',
      padding: '12px 16px',
    }),
  };

  return (
    <ReactSelect
      ref={reactSelectRef}
      styles={customStyles}
      value={value}
      onChange={onChange}
      options={options}
      isMulti={isMulti}
      isSearchable={isSearchable}
      placeholder={placeholder}
      className={className}
      menuIsOpen={programmaticOpen === null ? undefined : programmaticOpen}
      onMenuClose={() => { if (programmaticOpen !== null) setProgrammaticOpen(null); }}
      noOptionsMessage={() => "No results found"}
      closeMenuOnSelect={!isMulti}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      {...props}
    />
  );
});

export default Select;
