import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchEmail from "../components/SearchEmail";
import SendEmail from "../components/SendEmail";
import CreateNewPassword from "../components/CreateNewPassword";
import SuccessNewPassword from "../components/SuccessNewPassword";
import { useLoading } from "../context/LoadingContext";
import { baseAPIUrl } from "../config/apiConfig";

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1); // Track the current step (1 = SearchEmail, 2 = SendEmail, etc.)
    const [token, setToken] = useState<string | null>(null); // Token state for password reset
    const { incrementLoading, decrementLoading } = useLoading();
    const [role, setRole] = useState<string>("");

    // Function to navigate to the correct route when closing the modal
    const goHome = () => {
        const from = sessionStorage.getItem("from"); // Get the route from sessionStorage

        if (from === "/admin/login") {
            navigate("/admin/login");
        } else if (from === "/barangay/login") {
            navigate("/barangay/login");
        } else {
            navigate("/"); // Fallback to home if no route is stored
        }
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        decrementLoading();
    }, []);

    useEffect(() => {
        
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get("token");

        // Check if the token exists in the URL
        if (tokenFromUrl) {
            setToken(tokenFromUrl); // Set the token from the URL
            
            // Fetch to check token validity
            const checkTokenValidity = async () => {
                try {
                    incrementLoading();
                    const response = await fetch(`${baseAPIUrl}/auth/check/token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: tokenFromUrl }),
                    });
                    
                    if (!response.ok) {
                        throw new Error('Invalid token');
                    }
                    
                    setStep(3); // Proceed to Step 3
                    // If token is valid, continue
                } catch (error) {
                    decrementLoading();
                    // If token is invalid, redirect to Not Found
                    navigate("/not-found", { replace: true }); // Clean redirect
                } finally {
                    decrementLoading();
                }
            };

            checkTokenValidity();
        } else {
            // If token is not present, go to Step 1
            setStep(1);
            decrementLoading();
        }

        // Cleanup on component unmount or path change
        return () => {
            // Check if the user navigates away or reloads
            if (!location.pathname.includes("forgot-password")) {
                // Clear the token from the URL if it's no longer needed
                const url = new URL(window.location.href);
                url.searchParams.delete("token");
                window.history.replaceState({}, document.title, url.toString()); // Replace URL without reloading
                navigate("/not-found", { replace: true }); // Clean redirect if token is missing
            }
        };
    }, [location.search, location.pathname, navigate]);

    return (
        <div
            id="crud-modal"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            {step === 1 && <SearchEmail setStep={setStep} goHome={goHome} />}
            {step === 2 && <SendEmail setStep={setStep} goHome={goHome} />}
            {step === 3 && (
                <CreateNewPassword
                    token={token}
                    setToken={setToken}
                    setStep={setStep}
                    setRole={setRole}
                    goHome={goHome}
                />
            )}
            {step === 4 && <SuccessNewPassword role={role} />}
        </div>
    );
};

export default ForgotPassword;