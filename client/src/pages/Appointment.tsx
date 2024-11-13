import { useState, useEffect, FormEvent, useTransition, MouseEvent } from "react";
import cabuyao_logo from "../assets/images/cabuyao_logo.png";
import "../styles/appointment.css";
import { useAppointmentCategory } from "../hooks/useAppointmentCategory";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { baseAPIUrl } from "../config/apiConfig";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLoading } from "../context/LoadingContext";

interface FormData {
    first_name: string;
    last_name: string;
    sex: string;
    birthdate: string;
    address: string;
    appointment_date: string;
    appointment_category_name: string;
    email: string;
    phone_number: string;
    otp: string;
    patient_note: string;
    terms: boolean;
}

const Appointment: React.FC = () => {
    const { isLoading, incrementLoading, decrementLoading } = useLoading();
    const { loading, fetchAppointmentCategories, appointmentCategories } = useAppointmentCategory();
    const [formData, setFormData] = useState<FormData>({
        first_name: "",
        last_name: "",
        sex: "",
        birthdate: "",
        address: "",
        appointment_date: "",
        appointment_category_name: "",
        email: "",
        phone_number: "",
        otp: "",
        patient_note: "",
        terms: false,
    });
    const [resendCountdown, setResendCountdown] = useState(0);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [isPending, startTransition] = useTransition();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        }

        return () => clearTimeout(timer);
    }, [resendCountdown]);

    useEffect(() => {
        const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", { size: "invisible" });
        setRecaptchaVerifier(recaptchaVerifier);

        return () => recaptchaVerifier.clear();
    }, []);

    const handlePhoneNumberChange = (value: string | undefined) => {
        setFormData((prev) => ({ ...prev, phone_number: value || "" }));
    };

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, type } = event.target;

        // Use type guards to safely access 'checked' and 'value'
        if (type === "checkbox") {
            // Type assertion to access 'checked' for checkboxes
            const { checked } = event.target as HTMLInputElement;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            // For other input types, access 'value'
            const { value } = event.target as
                | HTMLInputElement
                | HTMLSelectElement
                | HTMLTextAreaElement;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const requiredFields: Array<keyof FormData> = [
            "first_name", "last_name", "sex", "birthdate", "address", "appointment_date",
            "appointment_category_name", "email", "phone_number", "otp", "terms"
        ];
    
        const minDate = new Date(); // Current date and time
        minDate.setHours(0, 0, 0, 0); // Reset to the start of the day (midnight)
    
        requiredFields.forEach((field) => {
            const value = formData[field];
            if (!value || (typeof value === "string" && value.trim() === "")) {
                errors[field] = field === "terms" ? "You must accept the terms and conditions." : "This field cannot be empty.";
            }
        });
    
        // Ensure the appointment_date is in the correct format for comparison
        const appointmentDate = new Date(formData.appointment_date);
        
        // If appointment_date is not a valid date object
        if (isNaN(appointmentDate.getTime())) {
            errors["appointment_date"] = "Invalid appointment date.";
        } else if (appointmentDate <= minDate) {
            errors["appointment_date"] = "Appointment date must be later than today's date.";
        }
    
        return errors;
    };

    const scrollToError = (fieldId: string) => {
        const errorElement = document.getElementById(fieldId);
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            errorElement.focus();
        }
    };

    const requestOtp = async (event?: MouseEvent<HTMLButtonElement>) => {
        event?.preventDefault();

        setResendCountdown(60);
        setErrors({});

        if (!recaptchaVerifier) {
            return setGeneralError("RecaptchaVerifier is not initialized");
        }
        
        const phoneNumber = formData.phone_number?.trim();
        if (!phoneNumber) {
            setErrors((prev) => ({ ...prev, phone_number: "Phone number is required." }));
            scrollToError('phone_number');
            return;
        }
        
        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            startTransition(() => {
                setConfirmationResult(confirmationResult);
            });
        } catch (error: any) {
            setResendCountdown(0);
            handleOTPError(error);
        }
    };

    const verifyOTP = async (): Promise<boolean> => {
        try {
            if (!confirmationResult) {
                setErrors((prev) => ({ ...prev, otp: "You must request an OTP before verifying." }));
                scrollToError('otp');
                return false;
            }

            const result = await confirmationResult.confirm(formData.otp);
            
            return !!result;
        } catch (error: any) {
            if (error.code === 'auth/invalid-verification-code') {
                setErrors((prev) => ({ ...prev, otp: "Invalid OTP. Please try again." }));
                scrollToError('otp');
            } else if (error.code === 'auth/code-expired') {
                setErrors((prev) => ({...prev, otp: "The OTP session has expired. Please request a new OTP."}));
                scrollToError('otp');
            } else {
                setGeneralError("An error occurred while verifying the OTP. Please try again.");
                Swal.fire({
                    title: "Error",
                    text: generalError || "An unknown error occurred. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
            return false;
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({});
        setGeneralError(null);

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Are you sure you want to book this appointment?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, book it!",
            cancelButtonText: "No, cancel!",
            customClass: {
                confirmButton:
                    "bg-green text-white px-4 py-2 rounded-md hover:bg-[#3d8c40]",
                cancelButton:
                    "bg-white  border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
            },
            buttonsStyling: false,
        });

        if (!result.isConfirmed) return;
    
        // Validate form data
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            scrollToError(Object.keys(validationErrors)[0]);
            return;
        }
        
        // Verify OTP
        const isOtpValid = await verifyOTP();
        if (!isOtpValid) return;
    
        try {
            incrementLoading();
            
    
            const response = await fetch(`${baseAPIUrl}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(formData),
            });
    
            // Handle response based on status code
            if (!response.ok) {
                await handleErrorResponse(response);
                return;
            }
    
            // Successful appointment creation
            const result = await response.json();
            sessionStorage.setItem("appointmentDetails", JSON.stringify({
                ...formData,
                queue_number: result.appointment.queue_number,
            }));
            showSuccessAlert();
        } catch (error) {
            handleErrorResponse(error as Response | Error);
        } finally {
            decrementLoading();
        }
    };
    
    // Helper function to handle error responses and network errors
    const handleErrorResponse = async (error: Response | Error) => {
        setGeneralError(null);

        if (error instanceof Response) {
            const data = await error.json();

            switch (error.status) {
                case 409:
                    setGeneralError("You already have an appointment on this date.");
                    break;
                case 422:
                    if (data.errors) {
                        setErrors(data.errors);
                    } else {
                        setGeneralError("Invalid data provided. Please check your inputs.");
                    }
                    break;
                default:
                    setGeneralError("An unexpected error occurred. Please try again later.");
                    break;
            }
        } else {
            setGeneralError("A network error occurred. Please check your connection and try again.");
        }
        showErrorAlert(generalError || "An error occured. Please try again.");
    };

    const showSuccessAlert = () => {
        Swal.fire({
            title: "Appointment Confirmed!",
            text: "Your appointment has been successfully booked.",
            icon: "success",
            confirmButtonText: "OK",
        }).then(() => navigate("/appointment/confirmation"));
    };

    const showErrorAlert = (message: string) => {
        Swal.fire({
            title: "Error",
            text: message,
            icon: "error",
            confirmButtonText: "OK",
        });
    };

    const handleOTPError = (error: any) => {
        if (error.code) {
            switch (error.code) {
                case "auth/invalid-phone-number":
                    setErrors((prev) => ({
                        ...prev,
                        phone_number: "Invalid phone number. Please check the number.",
                    }));
                    scrollToError('phone_number');
                    break;
                case "auth/too-many-requests":
                    setGeneralError("Too many requests. Please try again later.");
                    showErrorAlert(generalError || "Too many requests. Please try again later.");
                    break;
                default:
                    setGeneralError("Failed to send OTP. Please try again.");
                    showErrorAlert(generalError || "Failed to send OTP. Please try again.");
            }
        } else {
            setGeneralError("An unknown error occurred. Please try again.");
            showErrorAlert(generalError || "An unknown error occurred. Please try again.");
        }
    };

    const [minDate, setMinDate] = useState<string>("");

    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const dd = String(tomorrow.getDate()).padStart(2, "0");
        setMinDate(`${yyyy}-${mm}-${dd}`);
    }, []);

    useEffect(() => {
        fetchAppointmentCategories(formData.appointment_date);
    }, [formData.appointment_date])

    return (
        <>
            <div className="flex flex-col items-center justify-center gap-2 my-5 title">
                <img
                    className="size-44"
                    src={cabuyao_logo}
                    alt="City of Cabuyao Logo"
                />
                <h2 className="text-2xl font-bold text-black uppercase">
                    Book Appointment
                </h2>
            </div>

            <div
                id="dividing-line"
                className="w-11/12 h-1 bg-black rounded"
            ></div>

            <div className="flex flex-col items-center justify-center w-full px-2 sm:w-3/4 appointment-details">
                <h2 className="self-center my-5 text-lg font-bold uppercase md:self-start">
                    Personal Information
                </h2>

                <form
                    id="appointment"
                    className="flex flex-col justify-center w-full p-5 mt-2 mb-16 bg-white border-2 border-black rounded sm:w-3/4"
                    onSubmit={handleSubmit}
                >
                    <section className="flex flex-row flex-wrap gap-5 mb-3 input-group lg:flex-nowrap">
                        <div className="flex flex-col justify-center w-full gap-2 first-name">
                            <div className="flex items-center w-full gap-2 first-name">
                                <label className="min-w-24" htmlFor="first_name">
                                    First Name:
                                </label>
                                <input
                                    className="w-full border-gray-300 rounded-md border-[1px]"
                                    type="text"
                                    name="first_name"
                                    id="first_name"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {errors.first_name && (
                                <span className="text-red-600">
                                    {errors.first_name}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex flex-col justify-center w-full gap-2 last-name ">
                            <div className="flex items-center w-full gap-2 last-name">
                                <label className="min-w-24" htmlFor="last_name">
                                    Last Name:
                                </label>
                                <input
                                    className="w-full border-gray-300 rounded-md border-[1px]"
                                    type="text"
                                    name="last_name"
                                    id="last_name"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {errors.last_name && (
                                <span className="text-red-600"> 
                                    {errors.last_name}
                                </span>
                            )}
                        </div>
                    </section>

                    <div className="flex flex-col gap-2 mb-3 input-group">
                        <label htmlFor="sex">Sex:</label>
                        <div className="flex flex-row gap-5 sex-group justify-evenly">
                            <div className="flex gap-2 male">
                                <input
                                    type="radio"
                                    name="sex"
                                    id="male"
                                    value="Male"
                                    checked={formData.sex === "Male"}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="male">Male</label>
                            </div>
                            <div className="flex gap-2 female">
                                <input
                                    type="radio"
                                    name="sex"
                                    id="female"
                                    value="Female"
                                    checked={formData.sex === "Female"}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="female">Female</label>
                            </div>
                        </div>
                        {errors.sex && (
                            <span className="text-red-600">
                                {errors.sex}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="birthdate">Date of Birth:</label>
                        <input
                            className="w-full border-gray-300 rounded-md border-[1px]"
                            type="date"
                            name="birthdate"
                            id="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
                            required
                        />
                        {errors.birthdate && (
                            <span className="text-red-600">
                                {errors.birthdate}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="address">Address:</label>
                        <input
                            className="w-full border-gray-300 rounded-md border-[1px]"
                            type="text"
                            name="address"
                            id="address"
                            placeholder="House No. / Street / Barangay"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                        {errors.address && (
                            <span className="text-red-600">
                                {errors.address}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="appointment_date">
                            Appointment Date:
                        </label>
                        <input
                            className="w-full border-gray-300 rounded-md border-[1px]"
                            type="date"
                            name="appointment_date"
                            id="appointment_date"
                            value={formData.appointment_date}
                            onChange={handleChange}
                            min={minDate}
                            required
                        />
                        {errors.appointment_date && (
                            <span className="text-red-600">
                                {errors.appointment_date}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="appointment_category_name">
                            Appointment Type:
                        </label>
                        <select
                            className={`p-2 w-full border-gray-300 rounded-md border-[1px] ${formData.appointment_date === "" ? "cursor-not-allowed" : ""}`}
                            name="appointment_category_name"
                            id="appointment_category_name"
                            value={formData.appointment_category_name}
                            onChange={handleChange}
                            required
                            disabled={formData.appointment_date === "" || loading}
                        >   
                            {loading ? (
                                <option disabled>Loading...</option>
                            ) : (
                                formData.appointment_date !== "" ? (
                                    <>
                                        <option hidden>Select Type</option>
                                        {appointmentCategories.map(({ category, available_slots }) => (
                                            <option
                                                key={category.appointment_category_id}
                                                value={category.appointment_category_name}
                                                disabled={available_slots <= 0}
                                            >
                                                {category.appointment_category_name} 
                                                {available_slots != null ? ` (${available_slots} slots)` : ''}
                                            </option>
                                        ))}
                                    </>
                                ) : (
                                    <option hidden>Select appointment date first</option>
                                )
                            )}
                        </select>
                        {errors.appointment_category_name && (
                            <span className="text-red-600">
                                {errors.appointment_category_name}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            className="w-full border-gray-300 rounded-md border-[1px]"
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Your Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        {errors.email && (
                            <span className="text-red-600">{errors.email}</span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="phone_number">Phone Number:</label>
                        <PhoneInput
                            defaultCountry="PH"
                            value={formData.phone_number}
                            onChange={handlePhoneNumberChange}
                            id="phone_number"
                            className="w-full border-gray-300 rounded-md border-[1px] pl-2"
                            placeholder="09123456789"
                            required
                        />
                        {errors.phone_number && (
                            <span className="text-red-600">
                                {errors.phone_number}
                            </span>
                        )}
                        <div
                            className="flex items-center justify-center w-full mt-2 mb-0"
                            id="recaptcha"
                        />
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <button
                            type="button"
                            onClick={requestOtp}
                            disabled={!formData.phone_number || isPending || resendCountdown > 0}
                            className={`px-4 py-2 text-white transition-all rounded  ${!formData.phone_number || isPending || resendCountdown > 0 ? "bg-[#3d8c40] cursor-not-allowed" : "bg-green hover:opacity-90"}`}
                        >
                            {resendCountdown > 0 
                                ? `Resend OTP in ${resendCountdown}`
                                : isPending
                                ? "Sending OTP"
                                : "Send OTP"
                            }
                        </button>
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="otp">OTP:</label>
                        <input
                            className="w-full border-gray-300 rounded-md border-[1px]"
                            type="text"
                            name="otp"
                            id="otp"
                            placeholder="Enter OTP"
                            value={formData.otp}
                            onChange={handleChange}
                            required
                        />
                        {errors.otp && (
                            <span className="text-red-600">{errors.otp}</span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="patient_note">Additional Notes:</label>
                        <textarea
                            name="patient_note"
                            id="patient_note"
                            cols={50}
                            rows={10}
                            placeholder="Additional information or special requests"
                            value={formData.patient_note}
                            onChange={handleChange}
                            className="p-2 w-full border-gray-300 rounded-md border-[1px]"
                        />
                        {errors.patient_note && (
                            <span className="text-red-600">
                                {errors.patient_note}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center my-2 terms">
                        <div className="flex flex-row w-full gap-5 wrap md:w-3/4">
                            <input
                                className="scale-150"
                                type="checkbox"
                                name="terms"
                                id="terms"
                                checked={formData.terms}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="terms">
                                <p className="font-bold text-justify">
                                    I agree with the{" "}
                                    <span className="text-green hover:underline">
                                        <a target="_blank" href="/terms" rel="noopener noreferrer">
                                            Terms of Use
                                        </a>
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-green hover:underline">
                                        <a target="_blank" href="/privacy" rel="noopener noreferrer">
                                            Privacy Policy
                                        </a>
                                    </span>{" "}
                                    and I declare that I have read the
                                    Information that is required in accordance
                                    with{" "}
                                    <span className="text-green hover:underline">
                                        <a target="_blank" href="https://privacy.gov.ph/data-privacy-act/" rel="noopener noreferrer">
                                            RA 1073 (Data Privacy Act of 2012)
                                        </a>
                                    </span>
                                    .
                                </p>
                            </label>
                        </div>
                        {errors.terms && (
                            <span className="text-red-600">{errors.terms}</span>
                        )}
                    </div>

                    <button
                        className={`p-2 my-5 font-bold text-white uppercase transition-all rounded-lg shadow-xl ${isLoading ? "bg-[#3d8c40] cursor-not-allowed" : "bg-green hover:opacity-90"}`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Appointment;
