import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ChevronDown, Search } from "lucide-react";

const DROPDOWN_HEIGHT = 240;

function extractText(node) {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

const CustomSelect = forwardRef(
  (
    {
      name,
      value,
      onChange,
      children,
      className = "",
      placeholder = "Select an option",
      disabled = false,
      searchable = false,
      optionWidth,
      valueDisplay,
      fieldChanged = false,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [direction, setDirection] = useState("bottom");
    const [highlighted, setHighlighted] = useState(false);
    const [search, setSearch] = useState("");

    const wrapperRef = useRef(null);
    const buttonRef = useRef(null);
    const searchRef = useRef(null);
    const timeoutRef = useRef(null);

    useImperativeHandle(ref, () => ({
      highlight: () => {
        if (disabled) return;

        buttonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setHighlighted(true);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setHighlighted(false);
        }, 900);
      },
      focus: () => {
        if (disabled) return;
        setOpen(true);
        buttonRef.current?.focus();
      },
    }));

    useEffect(() => {
      return () => clearTimeout(timeoutRef.current);
    }, []);

    useEffect(() => {
      if (!open) setSearch("");
    }, [open]);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options = React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && child.type === "option"
    );

    const filteredOptions = searchable && search
      ? options.filter((opt) => {
          const text = (opt.props.value + " " + extractText(opt.props.children)).toLowerCase();
          return text.includes(search.toLowerCase());
        })
      : options;

    const selectedOption = options.find(
      (opt) => opt.props.value === value
    );

    const decideDirection = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setDirection(
        spaceBelow < DROPDOWN_HEIGHT && spaceAbove > spaceBelow
          ? "top"
          : "bottom"
      );
    };

    const handleToggle = () => {
      if (disabled) return;
      decideDirection();
      setOpen((p) => !p);
    };

    const handleSelect = (optionValue) => {
      if (disabled) return;
      onChange?.({ target: { name, value: optionValue } });
      setOpen(false);
    };

    const handleSearchKeyDown = (e) => {
      if (e.key === "ArrowDown" && filteredOptions.length > 0) {
        e.preventDefault();
        const first = document.querySelector("[data-option-index='0']");
        first?.focus();
      }
    };

    return (
      <div ref={wrapperRef} className={`relative text-sm`}>
        {/* Button */}
        <div
          ref={buttonRef}
          tabIndex={disabled ? -1 : 0}
          onClick={handleToggle}
          className={`${className} w-full flex items-center justify-between px-6 py-2.5 border rounded-md transition-all outline-none
            ${
              highlighted
                ? "border-[var(--primary-color)]"
                : disabled
                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                : "cursor-pointer border-gray-300"
            }
          `}
          style={fieldChanged && !highlighted ? { boxShadow: '0 0 0 2px #22c55e', borderColor: '#22c55e' } : undefined}
        >
          <span
            className={`truncate ${
              value ? "text-gray-800" : "text-gray-500"
            }`}
          >
            {valueDisplay ?? selectedOption?.props.children ?? placeholder}
          </span>

          <ChevronDown size={18} className="text-gray-500" />
        </div>

        {/* Dropdown */}
        {open && !disabled && (
          <div
            className={`absolute z-[999] bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto
              ${direction === "bottom" ? "mt-1 top-full" : "mb-1 bottom-full"}
            `}
            style={optionWidth ? { width: optionWidth, minWidth: wrapperRef.current?.offsetWidth } : { minWidth: wrapperRef.current?.offsetWidth }}
          >
            {searchable && (
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search country..."
                    className="w-full pl-8!"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-gray-400 text-sm text-center">No results found</div>
            ) : (
              filteredOptions.map((opt, idx) => (
                <div
                  key={opt.key}
                  data-option-index={idx}
                  tabIndex={-1}
                  onClick={() => handleSelect(opt.props.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSelect(opt.props.value);
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const next = document.querySelector(`[data-option-index='${idx + 1}']`);
                      next?.focus();
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const prev = document.querySelector(`[data-option-index='${idx - 1}']`);
                      prev?.focus();
                    }
                  }}
                  className={`px-4 py-2.5 cursor-pointer capitalize
                    ${
                      opt.props.value === value
                        ? "bg-[var(--accent-color)] text-[var(--primary-color)]"
                        : "text-gray-700 hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)]"
                    }
                  `}
                >
                  {opt.props.children}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

export default CustomSelect;
