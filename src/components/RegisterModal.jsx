import axios from "axios";
import { useContext, useState, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Lucide React Icons
import { Eye, EyeOff, XCircle, CheckCircle, Search, Building } from "lucide-react";
import ForgotPasswordModal from "./ForgotPasswordModal";

const RegisterModal = ({ setRegStep }) => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');

    console.log('user', user)
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate()

    // Form Data States
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(user === 'employee' && "employee" || 'user'); // 'user' (Job Seeker) or 'employee'

    // State for Password Visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // --- Real-time Password Match Check ---
    const passwordsMatch = useMemo(() => {
        // Only check if both fields have input
        if (password.length > 0 && confirmPassword.length > 0) {
            return password === confirmPassword;
        }
        // Return null if one or both fields are empty, so no message is shown initially
        return null;
    }, [password, confirmPassword]);

    // --- Real-time Password Strength/Validation Check ---
    const passwordValidation = useMemo(() => ({
        length: password.length >= 8,
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    }), [password]);

    const isPasswordValid = Object.values(passwordValidation).every(Boolean);

    const register = async (e) => {
        e.preventDefault();

        // Final check before API call
        if (password.length === 0 || confirmPassword.length === 0) {
            toast.error("Please enter and confirm your password.");
            return;
        }

        if (!passwordsMatch) {
            toast.error("Passwords do not match!");
            return;
        }

        // Validate password strength on submit
        if (!isPasswordValid) {
            toast.error("Password must be at least 8 characters long and include a number and special character.");
            return;
        }

        setLoading(true);
        localStorage.setItem("email", email);
        axios.defaults.withCredentials = true;

        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password, role });

            if (data.success) {
                toast.success(data.message);
                navigate('/register?verification=true')
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    // Component for a single role selection card/toggle
    const RoleToggle = ({ value, label, icon: Icon, isSelected, onClick }) => (
        <div
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-1 cursor-pointer transition-all duration-300 w-full md:w-1/2 ${isSelected
                ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10'
                : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
            onClick={onClick}
        >
            <Icon size={24} className={`${isSelected ? 'text-[var(--primary-color)]' : 'text-gray-500'}`} />
            <span className={`text-sm font-semibold mt-2 ${isSelected ? 'text-[var(--primary-color)]' : 'text-gray-700'}`}>
                {label}
            </span>
        </div>
    );
    if (showForgotPassword) {
        return <ForgotPasswordModal onBackToLogin={() => setShowForgotPassword(false)} />
    }

    return (
        <div className="flex w-full justify-center items-center bg-white">
            <div className="w-full px-8 md:px-32 lg:px-24 py-12 max-w-3xl">
                <form className="bg-white rounded-lg flex flex-col gap-2 border border-gray-200 p-8" onSubmit={register}>
                    <h1 className="text-gray-800 font-extrabold text-3xl mb-1">Join <span className="text-[var(--primary-color)]/90">Us</span></h1>
                    <p className="text-sm font-normal text-gray-500 mb-2">Select your account type to proceed.</p>

                    {/* Role Selection Toggle Boxes (NEW) */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <RoleToggle
                            value="user"
                            label="Candidate"
                            icon={Search}
                            isSelected={role === 'user'}
                            onClick={() => setRole('user')}
                        />
                        <RoleToggle
                            value="employee"
                            label="Employer"
                            icon={Building}
                            isSelected={role === 'employee'}
                            onClick={() => setRole('employee')}
                        />
                    </div>

                    {/* Name Field */}
                    <div className="w-full flex items-center gap-4">
                        <div className="w-full">
                            <label htmlFor="email" className='font-medium text-sm'>Full Name</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Email Field */}
                        <div className="w-full">
                            <label htmlFor="email" className='font-medium text-sm'>Email address</label>

                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>


                    {/* Password Field with Toggle */}
                    <div className="w-full">
                        <label htmlFor="email" className='font-medium text-sm'>Password</label>
                        <div className="flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="-ml-8 mt-1 text-gray-500 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Password Validation Feedback */}
                    <div className="flex flex-col gap-1 ml-2 mt-2">
                        <div className={`flex items-center gap-1.5 ${passwordValidation.length ? 'text-green-600' : 'text-red-500'}`}>
                            {passwordValidation.length ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span className="text-xs font-medium">At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordValidation.number ? 'text-green-600' : 'text-red-500'}`}>
                            {passwordValidation.number ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span className="text-xs font-medium">Contains a number</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${passwordValidation.special ? 'text-green-600' : 'text-red-500'}`}>
                            {passwordValidation.special ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span className="text-xs font-medium">Contains a special character</span>
                        </div>
                    </div>

                    {/* CONFIRM Password Field with Toggle & Feedback */}
                    <div className="flex flex-col gap-1">
                        <div className="">
                            <label htmlFor="email" className='font-medium text-sm'>Confirm Password</label>
                            <div className="flex items-center">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="-ml-8 mt-1 text-gray-500 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Real-Time Match Feedback */}
                        {passwordsMatch !== null && (
                            <div className={`flex items-center gap-1.5 ml-2 mt-2 transition-opacity ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                                {passwordsMatch ? (
                                    <>
                                        <CheckCircle size={16} />
                                        <span className="text-xs font-medium">Passwords Match!</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} />
                                        <span className="text-xs font-medium">Passwords do not match.</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        // Disable button if loading, passwords don't match, or required fields are empty
                        disabled={loading || password.length === 0 || confirmPassword.length === 0 || !passwordsMatch || !isPasswordValid}
                        className="primary-btn mt-2"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                    {/* Footer Links */}
                    <div className="flex justify-between mt-4 text-sm">
                        <span
                            onClick={() => setShowForgotPassword(true)}
                            className="text-gray-500 hover:text-[var(--primary-color)] cursor-pointer transition-colors font-medium"
                        >
                            Forgot Password?
                        </span>

                        <Link
                            to="/login"
                            className="text-gray-500 hover:text-[var(--primary-color)] cursor-pointer transition-colors font-medium"
                        >
                            Already have an account?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
