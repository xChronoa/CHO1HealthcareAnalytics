import { OTPInput } from "input-otp";
import Slot from "../components/Slot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FormData } from "./Appointment";

interface OTPVerificationProps {
    phoneNumber: string;
    isPending: boolean;
    resendCountdown: number;
    requestOtp: () => void;
    verifyOTP: (otp: string) => Promise<boolean>;
    isOpen: boolean;
    toggleForm: () => void;
    onVerified: () => void;
    formData: FormData;
    errors: Record<string, string>;
    isLoading: boolean;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
    phoneNumber,
    isPending,
    resendCountdown,
    requestOtp,
    isOpen,
    toggleForm,
    onVerified,
    formData,
    errors,
    isLoading,
    setFormData,
}) => {
    // Handle OTP input change
    const handleOtpChange = (newValue: string) => {
        setFormData((prev) => ({ ...prev, otp: newValue }));
    };

    return (
        <div
            id="crud-modal"
            tabIndex={-1}
            aria-hidden={!isOpen}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <div className="relative w-full max-w-md max-h-full p-4">
                <div className="relative bg-white rounded-lg shadow">
                    {/* Modal header */}
                    <div className="flex items-center justify-end p-4 rounded-t md:p-2 ">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 "
                            onClick={toggleForm}
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
                    <div className="p-4 md:p-5">
                        <div className="grid justify-center grid-cols-1 gap-4 mb-4 text-center">
                            <h1 className="text-lg font-bold text-center">
                                Mobile Phone Verification
                            </h1>
                            {errors.otp && (
                                <div
                                    className="flex items-center gap-2 p-4 text-sm text-left text-red-500 border border-red-600 rounded-lg"
                                    role="alert"
                                >
                                    <FontAwesomeIcon
                                        icon={faCircleExclamation}
                                        className="color-[#d66666] w-6 h-6"
                                    />
                                    <span className="sr-only">Info</span>
                                    <div className="text-xs sm:text-sm">
                                        <h4 className="font-bold">Verification Failed</h4>
                                        <p className="text-gray-500">{errors.otp}</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-gray-600 sm:text-sm">
                                {" "}
                                Enter the 6-digit OTP sent to your phone to
                                proceed with booking your appointment. This code
                                verifies your identity and secures the process.{" "}
                            </p>
                            <div className="group-input">
                                <OTPInput
                                    maxLength={6}
                                    value={formData.otp}
                                    onChange={handleOtpChange}
                                    containerClassName="group flex justify-center items-center has-[:disabled]:opacity-30"
                                    render={({ slots }) => (
                                        <>
                                            <div className="flex gap-2">
                                                {slots
                                                    .slice(0, 6)
                                                    .map((slot, idx) => (
                                                        <Slot
                                                            key={idx}
                                                            {...slot}
                                                            hasFakeCaret={
                                                                slot.isActive
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                        </>
                                    )}
                                />
                                <div className="flex flex-row items-center justify-center gap-1 mx-auto mt-4 text-xs resend">
                                    <p className="text-left text-gray-500">
                                        Didn't receive code?
                                    </p>
                                    <button
                                        onClick={requestOtp}
                                        disabled={!phoneNumber || isPending || resendCountdown > 0}
                                        className={`text-blue-600 transition-all rounded  disabled:text-blue-300 disabled:cursor-not-allowed hover:underline hover:opacity-90"}`}
                                    >
                                        {resendCountdown > 0 
                                            ? `Resend OTP in ${resendCountdown}`
                                            : isPending
                                            ? "Sending OTP..."
                                            : "Resend OTP"
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center w-full gap-2 py-2 pt-4">
                            <button
                                type="button"
                                onClick={onVerified}
                                className="transition-all text-[.7rem] sm:text-sm text-white flex justify-center items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-[75%]"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
