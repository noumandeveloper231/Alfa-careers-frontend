import { useState, useEffect, useMemo, useContext, useRef, forwardRef, useImperativeHandle } from "react";
import CustomSelect from "./CustomSelect";
import { AppContext } from "../context/AppContext";
import { Check } from "lucide-react";
import { IoIosWarning } from "react-icons/io";
import Tooltip from "./Tooltip";
import { useNavigate } from "react-router-dom";

const PhoneInputField = forwardRef(({
    value = "",
    onChange,
    placeholder = "Phone number",
    defaultCountry = "+1",
    className = "",
    setFormData
}, ref) => {
    useImperativeHandle(ref, () => ({
        focus: () => phoneRef.current?.focus(),
        scrollIntoView: (args) => phoneRef.current?.scrollIntoView(args),
    }));
    const navigate = useNavigate()
    const { userData } = useContext(AppContext);
    const [rawCountries, setRawCountries] = useState([]);
    const [countryCode, setCountryCode] = useState(defaultCountry);
    const [inputValue, setInputValue] = useState(defaultCountry);
    const containerRef = useRef(null);
    const phoneRef = useRef(null);
    const [optionWidth, setOptionWidth] = useState(null);

    // 🔹 Fetch countries ONCE
    useEffect(() => {
        fetch("https://aaapis.com/api/v1/info/countries/", {
            headers: {
                Authorization:
                    "Token a79da2a80970f48bedacb7a683f7e1262064db04",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setRawCountries(data.countries || []);
            })
            .catch((err) => console.error(err));
    }, []);

    // 🔹 Memoized country codes
    const COUNTRY_CODES = useMemo(() => {
        return rawCountries
            .filter(
                (c) =>
                    c.phone_international_prefix &&
                    c.country_code &&
                    c.name
            )
            .map((c) => ({
                label: c.country_code,
                value: `+${c.phone_international_prefix}`,
                name: c.name,
            }));
    }, [rawCountries]);

    // 🔹 Measure container width
    useEffect(() => {
        if (containerRef.current) {
            setOptionWidth(containerRef.current.offsetWidth + "px");
        }
    }, []);

    // 🔹 Sync controlled value
    useEffect(() => {
        if (!value || COUNTRY_CODES.length === 0) return;

        const matched = COUNTRY_CODES.find((c) =>
            value.startsWith(c.value)
        );

        if (matched) {
            setCountryCode(matched.value);
            setInputValue(value);
        }
    }, [value, COUNTRY_CODES]);

    const selectedCountry = COUNTRY_CODES.find(c => c.value === countryCode);

    const MAX_LENGTH_MAP = {
        "+1": 10, "+44": 11, "+61": 9, "+91": 10, "+92": 10,
        "+971": 9, "+966": 9, "+974": 8, "+965": 8, "+968": 8,
        "+973": 8, "+86": 11, "+81": 11, "+65": 8, "+60": 10,
        "+880": 10, "+94": 10, "+977": 10, "+63": 10, "+62": 12,
        "+66": 9, "+84": 10, "+82": 11, "+886": 9, "+852": 8,
        "+7": 10, "+49": 11, "+33": 9, "+39": 10, "+34": 9,
        "+351": 9, "+31": 10, "+32": 9, "+41": 9, "+43": 10,
        "+46": 10, "+47": 8, "+45": 8, "+358": 9, "+48": 9,
        "+420": 9, "+36": 9, "+40": 9, "+359": 9, "+30": 10,
        "+353": 9, "+64": 10, "+27": 10, "+20": 10, "+234": 11,
        "+254": 10, "+212": 9, "+213": 9, "+216": 8,
    };
    const maxDigits = MAX_LENGTH_MAP[countryCode] ?? 15;

    const handleCountryChange = (e) => {
        const newCode = e.target.value;
        const digits = inputValue.replace(countryCode, "").replace(/\D/g, "").slice(0, MAX_LENGTH_MAP[newCode] ?? 15);
        const newValue = newCode + (digits ? " " + digits : "");

        setCountryCode(newCode);
        setInputValue(newValue);
        setFormData(prev => ({ ...prev, phone: newValue }));
        phoneRef.current?.focus();
    };

    const handleInputChange = (e) => {
        let val = e.target.value;

        if (!val.startsWith(countryCode)) {
            val = countryCode + val.replace(/\D/g, "");
        }

        const digits = val.slice(countryCode.length).replace(/\D/g, "").slice(0, maxDigits);
        const finalValue = countryCode + " " + digits;

        setInputValue(finalValue);
        setFormData(prev => ({ ...prev, phone: finalValue }));
    };

    return (
        <div
            ref={containerRef}
            className={`flex relative border focus:border-[var(--primary-color)] border-gray-300 items-center ${className}`}
        >
            {/* Country Select */}
            <CustomSelect
                className="!rounded-r-none !px-4 !border-0 !border-r-2"
                value={countryCode}
                onChange={handleCountryChange}
                searchable
                optionWidth={optionWidth}
                valueDisplay={
                    <div className="flex items-center gap-2">
                        <img
                            src={`https://flagcdn.com/24x18/${selectedCountry?.label?.toLowerCase() || "us"}.png`}
                            alt={selectedCountry?.label || ""}
                            width={24}
                            height={16}
                        />
                        <span>{selectedCountry?.label || ""}</span>
                    </div>
                }
            >
                {COUNTRY_CODES.map(c => (
                    <option key={`${c.label}-${c.value}`} value={c.value}>
                        <div className="flex items-center gap-3">
                            <img
                                src={`https://flagcdn.com/24x18/${c.label.toLowerCase()}.png`}
                                alt={c.label}
                                width={24}
                                height={16}
                                className="shrink-0"
                            />
                            <span className="font-medium">{c.name}</span>
                            <span className="text-gray-400 ml-auto" style={{ minWidth: 'fit-content' }}>{c.value}</span>
                        </div>
                    </option>
                ))}
            </CustomSelect>

            {/* Phone Input */}
            <input
                ref={phoneRef}
                type="tel"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="flex-1 !rounded-l-none !border-0 px-2 py-1"
            />
        </div>
    );
});

export default PhoneInputField;
