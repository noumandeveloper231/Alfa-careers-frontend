import { useState } from "react";

function Tooltip({ children, text, className, onClick }) {
    const [show, setShow] = useState(false);

    return (
        <span
            onClick={onClick}
            className={`cursor-pointer ${className}`}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}

            {show && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap z-50">
                    {text}
                    <div className="absolute top-4/5 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
            )}
        </span>
    );
}

export default Tooltip;
