import axios from "axios";
import { useContext, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AppContext } from "../context/AppContext";
import { Loader, Upload, Download } from "lucide-react";

const MyResume = () => {
    const { backendUrl, userData, setUserData } = useContext(AppContext);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const search = new URLSearchParams(window.location.search)
    const isRef = search.get('focusField')
    const fileInputRef = useRef();
    const blobUrlRef = useRef(null);

    useEffect(() => {
        if (isRef) {
            fileInputRef.current.click();
        }
    }, [isRef]);

    useEffect(() => {
        let cancelled = false;

        async function loadPdf() {
            if (!userData?.resume) return;

            setPdfLoading(true);
            try {
                const response = await fetch(userData.resume);
                let blob = await response.blob();
                if (blob.type !== 'application/pdf') {
                    blob = new Blob([blob], { type: 'application/pdf' });
                }
                if (!cancelled) {
                    const url = URL.createObjectURL(blob);
                    blobUrlRef.current = url;
                    setPdfBlobUrl(url);
                    setPdfLoading(false);
                }
            } catch (err) {
                if (!cancelled) setPdfLoading(false);
            }
        }

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }

        loadPdf();

        return () => {
            cancelled = true;
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [userData?.resume]);

    const changeResume = async (resume) => {
        if (!resume) return;

        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(resume.type)) {
            toast.error('Please upload a PDF or Word document');
            return;
        }

        if (resume.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append("resume", resume);
        setUploading(true);

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/updateresume`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (data.success) {
                setUserData(data.profile);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) changeResume(file);
    };

    return (
        <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
            <div className="">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-6">
                    My Resume
                </h1>

                {userData?.resume && (
                    <div className="mb-8">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <span className="text-sm text-gray-600 font-medium">Resume Preview</span>
                                <a
                                    href={userData.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-color)] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Download size={15} />
                                    <span>Download</span>
                                </a>
                            </div>
                            <div className="bg-gray-100">
                                {pdfLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
                                    </div>
                                ) : pdfBlobUrl ? (
                                    <iframe
                                        src={pdfBlobUrl}
                                        width="100%"
                                        height="600"
                                        className="border-0"
                                        title="Resume PDF"
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        {userData?.resume ? 'Update Resume' : 'Upload Resume'}
                    </h3>

                    <div
                        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${dragOver
                            ? "border-[var(--primary-color)] bg-blue-50"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                        onClick={() => fileInputRef.current.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                        }}
                        onDrop={handleDrop}
                    >
                        {uploading ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader className="w-12 h-12 animate-spin text-[var(--primary-color)]" />
                                <span className="text-lg font-medium text-gray-700">Uploading your resume...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-blue-50 rounded-full">
                                    <Upload className="w-10 h-10 text-[var(--primary-color)]" />
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => changeResume(e.target.files[0])}
                            disabled={uploading}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
};

export default MyResume;
