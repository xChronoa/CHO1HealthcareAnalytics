import Swal from "sweetalert2";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook

interface SendEmailProps {
    setStep: (step: number) => void;
    goHome: () => void;
}

const SendEmail: React.FC<SendEmailProps> = ({ goHome }) => {
    const { incrementLoading, decrementLoading } = useLoading();
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // state for success message
    const [email, setEmail] = useState<string>(localStorage.getItem("email") || "");
    const navigate = useNavigate(); // Hook for navigation

    // Check if email exists in localStorage or is part of a valid flow
    useEffect(() => {
        const email = localStorage.getItem("email");
        if (!email) {
            navigate("/not-found"); // Redirect if email is not in localStorage
        }
    }, [navigate]);

    const handleSend = async () => {
        try {
            incrementLoading();
            const email = localStorage.getItem("email");

            if(!email) return;
            setEmail(email);
            
            const response = await fetch(`${baseAPIUrl}/auth/email/send/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccessMessage("A password reset email has been sent to your email address. Please check your inbox.");
                localStorage.removeItem("email");
            } else {
                const data = await response.json();
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: data.error || "Failed to send email.",
                    scrollbarPadding: false,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Unexpected Error",
                text: "Could not send the email. Please try again later.",
                scrollbarPadding: false,
            });
        } finally {
            decrementLoading();
        }
    };

    const obfuscateEmail = (email: string): string => {
        if (!email) return "";
        const [local, domain] = email.split("@");
        const obfuscatedLocal = local[0] + "*".repeat(local.length - 1);
        const obfuscatedDomain = domain.replace(/(\w{1}).*?(\w{1})$/, "$1****$2");
        return `${obfuscatedLocal}@${obfuscatedDomain}`;
    };

    return (
        <div className="relative w-full max-w-md max-h-full p-4">
            <div className="relative bg-white rounded-lg shadow">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Where would we send a confirmation code?
                    </h3>
                    <button
                        type="button"
                        onClick={goHome}
                        className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 "
                    >
                        <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* Modal body */}
                <section className="p-4 md:p-5">
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <p className="col-span-1 text-justify">
                            Before you can change your password, we need to make sure it’s really you.
                        </p>
                        <div className="relative z-0 w-full mt-5 mb-5 group">
                            <p>
                                Send an email to {obfuscateEmail(email)}
                            </p>
                        </div>
                        {/* Display success message if it exists */}
                        {successMessage && (
                            <div className="font-semibold text-green-600">
                                {successMessage}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-between gap-2 mt-10">
                        {!successMessage && (
                            <button
                                type="button"
                                onClick={handleSend}
                                className="transition-all text-[.7rem] sm:text-sm text-white w-full bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Send Email
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={goHome}
                            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-400 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                        >
                            Cancel
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SendEmail;
