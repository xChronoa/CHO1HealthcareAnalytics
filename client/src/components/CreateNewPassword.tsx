import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

interface CreateNewPasswordProps {
    token: string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
    setStep: (step: number) => void;
    goHome: () => void;
}

const CreateNewPassword: React.FC<CreateNewPasswordProps> = ({ 
    token, 
    setToken, 
    setStep, 
    goHome 
}) => {
    const { incrementLoading, decrementLoading } = useLoading();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState(false);

    const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({
        newPassword: false,
        confirmPassword: false,
    });

    const togglePasswordVisibility = (field: "newPassword" | "confirmPassword") => {
        setIsVisible((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };

    const handleReset = async () => {
        // Check if passwords match before proceeding
        if (password !== confirmPassword) {
            setPasswordMatchError(true);
            return;
        }
    
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/auth/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token, // Using the token prop passed in
                    password,
                    password_confirmation: confirmPassword,
                }),
            });
    
            if (response.ok) {
                setStep(4); // Proceed to the success step
                setToken(null); // Clear the token in the state
    
                // Clear the token from the URL
                const url = new URL(window.location.href);
                url.searchParams.delete("token");
                window.history.replaceState({}, document.title, url.toString()); // Replace URL without reloading
            } else {
                const data = await response.json();
                setError(data.error || "Failed to reset password");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            decrementLoading();
        }
    };

    return (
        <div className="relative w-full max-w-md max-h-full p-4">
            <div className="relative bg-white rounded-lg shadow">
                <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5">
                    <h3 className="text-lg font-semibold text-gray-900">Choose a new password</h3>
                    <button
                        type="button"
                        onClick={goHome}
                        className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
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

                <section className="p-4 md:p-5">
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <p className="col-span-1 text-justify">
                            Make sure your new password is 8 characters or more. Try including numbers, letters, and punctuation marks for a strong password.
                        </p>

                        <div className="space-y-5">
                            {error && <p className="text-red-500">{error}</p>}  {/* Error message display */}
                            
                            {/* New Password Field */}
                            <div className="relative z-0 w-full mt-5 mb-5 group">
                                <input
                                    type={isVisible.newPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    name="floating_new_password"
                                    id="floating_new_password"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer pr-10"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="floating_new_password"
                                    className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600"
                                >
                                    New Password
                                </label>
                                <FontAwesomeIcon
                                    onClick={() => togglePasswordVisibility("newPassword")}
                                    icon={isVisible.newPassword ? faEye : faEyeSlash}
                                    className="absolute text-gray-500 transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                />
                            </div>

                            {/* Confirm Password Field */}
                            <div className="relative z-0 w-full mt-5 mb-5 group">
                                {passwordMatchError && (
                                    <p className="text-red-500">Passwords do not match!</p>
                                )}
                                <input
                                    type={isVisible.confirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    name="floating_confirm_password"
                                    id="floating_confirm_password"
                                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer pr-10"
                                    placeholder=" "
                                    required
                                />
                                <label
                                    htmlFor="floating_confirm_password"
                                    className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600"
                                >
                                    Confirm Password
                                </label>
                                <FontAwesomeIcon
                                    onClick={() => togglePasswordVisibility("confirmPassword")}
                                    icon={isVisible.confirmPassword ? faEye : faEyeSlash}
                                    className="absolute text-gray-500 transform -translate-y-1/2 cursor-pointer right-2 top-1/2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-2">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="transition-all text-[.7rem] sm:text-sm text-white w-full bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center"
                        >
                            Change Password
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CreateNewPassword;
