import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

let showLoginFn;

export const openLoginPortal = () => {
    if (showLoginFn) showLoginFn(true);
};

export const closeLoginPortal = () => {
    if (showLoginFn) showLoginFn(false);
};

const LoginPortalManager = () => {
    const [visible, setVisible] = useState(false);
    const [anim, setAnim] = useState(false);
    const navigate = useNavigate();

    const closeTimerRef = useRef(null);

    useEffect(() => {
        showLoginFn = (state) => {
            if (state) {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                setVisible(true);
                setTimeout(() => setAnim(true), 10);
            } else {
                setAnim(false);
                closeTimerRef.current = setTimeout(() => setVisible(false), 300);
            }
        };

        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            showLoginFn = null;
        };
    }, []);

    if (!visible) return null;

    return createPortal(
        <div
            className={`fixed top-0 left-0 w-full h-screen flex items-center justify-center backdrop-blur-sm transition-all duration-300 z-[999] ${
                anim ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => closeLoginPortal()}
        >
            <div
                className={`relative bg-[var(--accent-color)] border border-[var(--primary-color)]/20 flex flex-col items-center gap-4 shadow-xl rounded-2xl p-8 transition-all duration-300 transform ${
                    anim ? "scale-100" : "scale-90"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <span
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => closeLoginPortal()}
                >
                    <X />
                </span>

                <h3 className="font-bold">Please <span className="font-semibold text-[var(--primary-color)]">Login</span> First</h3>

                <button
                    className="primary-btn w-full"
                    onClick={() => {
                        closeLoginPortal();
                        navigate("/login");
                    }}
                >
                    Login
                </button>

                <p>
                    You need to be <span className="font-semibold text-[var(--primary-color)]">logged in</span> to
                    continue.
                </p>
            </div>
        </div>,
        document.body
    );
};

export default LoginPortalManager;