interface InputFieldProps {
    labelText?: string;
    type?: string;
    placeholder?: string;
    min?: string;
    style?: string;
    required?: boolean;
    value?: any;
    onChange?:  (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
    labelText,
    type,
    placeholder,
    min,
    style,
    required,
    value,
    onChange,
}) => {
    return (
        <label className="w-full block">
            <span className="text-gray-700">{labelText}</span>
            <input
                type={type}
                placeholder={placeholder}
                min={min}
                required={required}
                value={value}
                onChange={onChange}
                className={style}
            />
        </label>
    );
};
