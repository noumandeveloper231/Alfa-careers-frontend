import { createPortal } from "react-dom";
import { useEffect, useState, useContext } from "react";
import { ExternalLink, Mail, PhoneIcon, X, AlertCircle, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { AppContext } from "../context/AppContext";

// Global open function
let openApplyPortalFn = null;

export const openApplyJobPortal = (jobData, id) => {
    if (openApplyPortalFn) openApplyPortalFn({ jobData, id });
};

const ApplyJobPortalManager = () => {
    const navigate = useNavigate();
    const { userData, backendUrl } = useContext(AppContext);

    const [portalData, setPortalData] = useState(null);
    const [anim, setAnim] = useState(false);
    const [loading, setLoading] = useState(false);

    // Expose global function
    useEffect(() => {
        openApplyPortalFn = (data) => {
            setPortalData(data);
            setTimeout(() => setAnim(true), 20);
        };
        return () => (openApplyPortalFn = null);
    }, []);

    if (!portalData) return null;

    const { jobData, id } = portalData;

    const closePortal = () => {
        setAnim(false);
        setTimeout(() => setPortalData(null), 200);
    };

    const isProfileComplete = () => {
        if (!userData) return false;
        const hasFields = userData.name && userData.email && userData.phone;
        const hasResume = userData.resume;
        return hasFields && hasResume;
    };

    const showProfileWarning = jobData?.jobApplyType === "Internal" && !isProfileComplete();

    // Apply Button
    const getApplyButtonContent = () => {
        switch (jobData?.jobApplyType) {
            case "External": return { text: "Apply on External Site", icon: <ExternalLink size={18} /> };
            case "Email": return { text: "Apply via Email", icon: <Mail size={18} /> };
            case "Call": return { text: "Call to Apply", icon: <PhoneIcon size={18} /> };
            default: return { text: "Submit Application", icon: <Briefcase size={18} /> };
        }
    };

    const buttonContent = getApplyButtonContent();

    // Apply Handler
    const handleApply = async () => {
        const type = jobData?.jobApplyType;

        if (type === "External") {
            window.open(jobData.externalUrl, "_blank");
            return closePortal();
        }

        if (type === "Email") {
            const subject = encodeURIComponent(`Application for ${jobData.title}`);
            const body = encodeURIComponent(`Dear Hiring Manager,\n\nI am applying for ${jobData.title}.\n`);
            window.location.href = `mailto:${jobData.userEmail}?subject=${subject}&body=${body}`;
            return closePortal();
        }

        if (type === "Call") {
            window.location.href = `tel:${jobData.callNumber}`;
            return closePortal();
        }

        if (!isProfileComplete()) {
            toast.error("Complete profile and upload resume first");
            navigate("/my-profile");
            return closePortal();
        }

        setLoading(true);
        try {
            const { data } = await axios.post(backendUrl + "/api/user/applyjob", { jobId: id });
            if (data.success) toast.success(data.message);
            else toast.error(data.message);
        } catch (err) {
            toast.error("Application failed");
        } finally {
            setLoading(false);
            closePortal();
        }
    };

    return createPortal(
        <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] transition-all duration-300 ${anim ? "opacity-100" : "opacity-0"
                }`}
            onClick={closePortal}
        >
            <div
                className={`relative bg-white max-w-xl w-full rounded-2xl p-8 shadow-xl transition-all duration-300 transform ${anim ? "scale-100" : "scale-95"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <X
                    size={24}
                    onClick={closePortal}
                    className="absolute top-5 right-5 cursor-pointer hover:rotate-90 transition"
                />

                {/* HEADER */}
                <h2 className="text-xl font-bold mb-4">
                    {jobData?.jobApplyType === "Internal" ? "Alfa Careers Profile" : "Apply"}
                </h2>

                {/* PROFILE CHECK */}
                {showProfileWarning && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm">
                        <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-800">Profile Incomplete</p>
                            <p>Please complete your profile and upload a resume.</p>
                        </div>
                    </div>
                )}

                {/* APPLY BUTTON */}
                <button
                    onClick={handleApply}
                    disabled={loading || showProfileWarning}
                    className={`w-full primary-btn ${(loading || showProfileWarning) ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {buttonContent.icon}
                    {loading ? "Applying..." : buttonContent.text}
                </button>
            </div>
        </div>,
        document.body
    );
};

export default ApplyJobPortalManager;
