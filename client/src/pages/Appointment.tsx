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
import OTPVerification from "./OTPVerification";

export interface FormData {
    first_name: string;
    last_name: string;
    sex: string;
    birthdate: string;
    address: string;
    appointment_date: string;
    appointment_category_name: string;
    email: string;
    phone_number: string;
    patient_note: string;
    terms: boolean;
    otp?: string;
}

const Appointment: React.FC = () => {
    const { isLoading, incrementLoading, decrementLoading } = useLoading();
    const { loading, fetchAppointmentCategories, appointmentCategories } = useAppointmentCategory();
    const [formData, setFormData] = useState<FormData>(() => {
        const savedFormData = sessionStorage.getItem('appointmentData');
        return savedFormData ? JSON.parse(savedFormData) : {
            first_name: "",
            last_name: "",
            sex: "",
            birthdate: "",
            address: "",
            appointment_date: "",
            appointment_category_name: "",
            email: "",
            phone_number: "",
            patient_note: "",
            otp: "",
            terms: false,
        };
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

    const validateForm = (origin: string) => {
        const errors: Record<string, string> = {};
    
        if (origin === "appointment") {
            // Fields to validate for appointment
            const requiredFields: Array<keyof FormData> = [
                "first_name", "last_name", "sex", "birthdate", "address", 
                "appointment_date", "appointment_category_name", "email", 
                "phone_number", "terms"
            ];
    
            const minDate = new Date(); // Current date and time
            minDate.setHours(0, 0, 0, 0); // Reset to the start of the day (midnight)
    
            requiredFields.forEach((field) => {
                const value = formData[field];
                if (!value || (typeof value === "string" && value.trim() === "")) {
                    errors[field] = field === "terms"
                        ? "You must accept the terms and conditions."
                        : "This field cannot be empty.";
                }
            });
            
            // Validate phone number length
            const phoneNumber = formData.phone_number.trim();
            if (phoneNumber.length < 10 || phoneNumber.length > 15) {
                errors["phone_number"] = "Phone number must be between 10 and 15 digits.";
            }
    
            // Validate appointment_date
            const appointmentDate = new Date(formData.appointment_date);
            if (isNaN(appointmentDate.getTime())) {
                errors["appointment_date"] = "Invalid appointment date.";
            } else if (appointmentDate <= minDate) {
                errors["appointment_date"] = "Appointment date must be later than today's date.";
            }
    
            // Validate birthdate
            const birthdate = new Date(formData.birthdate);
            if (isNaN(birthdate.getTime())) {
                errors["birthdate"] = "Invalid birthdate.";
            } else {
                const age = calculateAge(birthdate);
                if (age < 18) {
                    errors["birthdate"] = "You must be at least 18 years old.";
                }
            }
        } else if (origin === "otp-verify") {
            // Only validate OTP
            if (!formData.otp || formData.otp.trim() === "") {
                errors["otp"] = "OTP is required.";
            }
        }
    
        return errors;
    };
    
    // Helper function to calculate age based on birthdate
    const calculateAge = (birthdate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDifference = today.getMonth() - birthdate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }
        return age;
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
        
        if(resendCountdown > 0) return;
    
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
            // Start the countdown only if the OTP is sent successfully
            const countdownEndTime = Date.now() + 60 * 1000; // 60 seconds from now
            localStorage.setItem("resendCountdown", countdownEndTime.toString()); // Store countdown end time
            
            setResendCountdown(60);
    
            startTransition(() => {
                setConfirmationResult(confirmationResult);
            });

            toggleForm();
        } catch (error: any) {
            // Reset countdown in case of error
            setResendCountdown(0);
            localStorage.removeItem("resendCountdown"); // Clear the stored countdown if there's an error
    
            handleOTPError(error);
        }
    };
    

    const verifyOTP = async (otp: string): Promise<boolean> => {
        try {
            if (!confirmationResult) {
                setErrors((prev) => ({ ...prev, otp: "You must request an OTP before verifying." }));
                scrollToError('otp');
                decrementLoading();
                return false;
            }

            const result = await confirmationResult.confirm(otp);
            
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
                    scrollbarPadding: false,
                });
            }
            decrementLoading();
            return false;
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors({});
        setGeneralError(null);

        // Validate form data
        const validationErrors = validateForm("appointment");
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            scrollToError(Object.keys(validationErrors)[0]);
            return;
        }

        const { first_name, last_name, sex, birthdate, address, email, phone_number, appointment_date, appointment_category_name } = formData;

        const result = await Swal.fire({
            title: "Confirm Appointment Details",
            html: `
            <p class="mb-4">Are you sure you want to book this appointment?</p>
                <div class="border-2 border-black rounded-lg text-xs text-left p-4">
                    <h3 class="text-sm sm:text-lg font-bold mb-2">
                        ${first_name} ${last_name}
                    </h3>
                    <div class="w-full h-[2px] border-green border-t-[3px] rounded-md mb-4"></div>

                    <div class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-3">
                        <span class="font-semibold">Sex:</span>
                        <span class="capitalize">${sex}</span>

                        <span class="font-semibold">Birthdate:</span>
                        <span>${formatDateForDisplay(birthdate)}</span>

                        <span class="font-semibold">Address:</span>
                        <span class="break-words">${address}</span>

                        <span class="font-semibold">Email:</span>
                        <span class="break-words">${email}</span>

                        <span class="font-semibold">Phone Number:</span>
                        <span>${phone_number}</span>

                        <span class="font-semibold">Appointment Date:</span>
                        <span>${formatDateForDisplay(appointment_date)}</span>

                        <span class="font-semibold">Appointment Type:</span>
                        <span>${appointment_category_name}</span>
                    </div>
                </div>
                
            `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, book it!",
            cancelButtonText: "No, cancel!",
            customClass: {
                title: "text-lg sm:text-2xl",
                confirmButton:
                    "bg-green text-white px-4 py-2 rounded-md hover:bg-[#3d8c40]",
                cancelButton:
                    "bg-white border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
            },
            buttonsStyling: false,
            scrollbarPadding: false,
        });
        
        if (!result.isConfirmed) return;
        
        requestOtp();
    };

    const bookAppointment = async () => {
        setErrors({});
        
        // Validate form data
        const validationErrors = validateForm("otp-verify");
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            scrollToError(Object.keys(validationErrors)[0]);
            return;
        }
        
        if (!formData.otp) return;

        incrementLoading();

        // Check if OTP is already verified and valid from session storage or previous request
        let isOtpValid = sessionStorage.getItem("otpValid") === "true"; // Retrieve OTP validity status
        
        if (!isOtpValid) {
            // If OTP is not valid, request OTP verification
            const otpVerified = await verifyOTP(formData.otp);  // OTP verification process
            if (!otpVerified) return;
            sessionStorage.setItem("otpValid", "true");  // Store OTP validity for future use
        }

        try {
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
    
            // If successful, invalidate the OTP and save appointment details
            sessionStorage.removeItem("otpValid");  // Invalidate the OTP after successful submission
            const result = await response.json();
            sessionStorage.setItem("appointmentDetails", JSON.stringify({
                ...formData,
                queue_number: result.appointment.queue_number,
            }));
            showSuccessAlert();
            toggleForm();
        } catch (error) {
            handleErrorResponse(error as Response | Error);
        } finally {
            decrementLoading();
        }
    };
    
    // Helper function to handle error responses and network errors
    const handleErrorResponse = async (error: Response | Error) => {
        setGeneralError(null);
    
        let errorMessage = "An error occurred. Please try again."; // Default error message
    
        if (error instanceof Response) {
            const data = await error.json();
    
            switch (error.status) {
                case 409:
                    errorMessage = "You already have an appointment scheduled for this date. Please choose a different date.";
                    break;
                case 422:
                    if (data.errors) {
                        setErrors(data.errors); // Set specific form field errors
                        errorMessage = "Invalid data provided. Please check your inputs and try again.";
                    }
                    break;
                case 400:
                    if (data.error) {
                        errorMessage = data.error;
                    } else {
                        errorMessage = "The requested appointment cannot be booked. Please try a different date or category.";
                    }
                    break;
                case 500:
                    errorMessage = "An unexpected error occurred while processing your appointment. Please try again later.";
                    break;
                default:
                    errorMessage = "An unexpected error occurred. Please try again later.";
                    break;
            }
        } else {
            errorMessage = "A network error occurred. Please check your connection and try again.";
        }
    
        setGeneralError(errorMessage); // Update state for potential UI reflection
        showErrorAlert(errorMessage, getErrorTitle(error instanceof Response ? error.status : 0)); // Pass title dynamically
    };

    const getErrorTitle = (statusCode: number) => {
        switch (statusCode) {
            case 409:
                return "Appointment Conflict";
            case 422:
                return "Invalid Input";
            case 400:
                return "Bad Request";
            case 500:
                return "Server Error";
            default:
                return "Something Went Wrong";
        }
    };

    const showSuccessAlert = () => {
        Swal.fire({
            title: "Appointment Confirmed!",
            text: "Your appointment has been successfully booked.",
            icon: "success",
            confirmButtonText: "OK",
            scrollbarPadding: false,
        }).then(() => navigate("/appointment/confirmation"));
    };

    const showErrorAlert = (message: string, title: string) => {
        Swal.fire({
            title: title,
            text: message,
            icon: "error",
            confirmButtonText: "OK",
            scrollbarPadding: false,
        });
    };

    // OTP error handler
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
                    const tooManyRequestsMessage = "Too many requests. Please try again later.";
                    setGeneralError(tooManyRequestsMessage);
                    showErrorAlert(tooManyRequestsMessage, "Request Limit Exceeded");
                    break;
                default:
                    const defaultOTPError = "Failed to send OTP. Please try again.";
                    setGeneralError(defaultOTPError);
                    showErrorAlert(defaultOTPError, "OTP Error");
            }
        } else {
            const unknownError = "An unknown error occurred. Please try again.";
            setGeneralError(unknownError);
            showErrorAlert(unknownError, "Unknown Error");
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

        setFormData((prev) => {
            return {
               ...prev,
                appointment_category_name: "",
            };
        })
    }, [formData.appointment_date])

    useEffect(() => {
        // Check if there is a countdown value in localStorage
        const storedCountdown = localStorage.getItem("resendCountdown");
        if (storedCountdown) {
            const timeRemaining = Math.max(0, Math.ceil((+storedCountdown - Date.now()) / 1000));
            if (timeRemaining > 0) {
                setResendCountdown(timeRemaining);
    
                // Update countdown in intervals
                const interval = setInterval(() => {
                    const newTimeRemaining = Math.max(0, Math.ceil((+storedCountdown - Date.now()) / 1000));
                    setResendCountdown(newTimeRemaining);
    
                    if (newTimeRemaining === 0) {
                        clearInterval(interval);
                        localStorage.removeItem("resendCountdown");
                    }
                }, 1000);
    
                return () => clearInterval(interval); // Cleanup interval on unmount
            } else {
                localStorage.removeItem("resendCountdown");
            }
        }
    }, []);

    const formatDateForDisplay = (dateStr: string) => {
        if(!dateStr) return "";
        
        const [year, month, day] = dateStr.split("-");

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };
    
    const [isOpen, setIsOpen] = useState(false);

    const toggleForm = () => {
        setIsOpen((prev) => !prev);
        document.body.style.overflow = isOpen ? "" : "hidden";
    };

    useEffect(() => {
        const hasData = Object.values(formData).some(value => value !== "");
        
        if (hasData) {
            sessionStorage.setItem('appointmentData', JSON.stringify(formData));
        }
    }, [formData]);

    return (
        <div className="container">
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

            <div id="dividing-line" className="w-full h-1 bg-black rounded" />

            <div className="flex flex-col items-center justify-center w-full px-2 appointment-details">
                <h2 className="self-center my-5 text-lg font-bold uppercase md:self-start">
                    Personal Information
                </h2>

                <form
                    id="appointment"
                    className="flex flex-col justify-center w-full p-5 mt-2 mb-16 bg-white border-2 border-black rounded lg:w-3/4"
                    onSubmit={handleSubmit}
                >
                    <section className="flex flex-row flex-wrap gap-5 mb-3 input-group lg:flex-nowrap">
                        <div className="flex flex-col justify-center w-full gap-2 first-name">
                            <div className="flex flex-col w-full gap-2 first-name">
                                <label className="flex flex-row min-w-24 required-label-after" htmlFor="first_name">
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
                            <div className="flex flex-col w-full gap-2 last-name">
                                <label className="flex flex-row min-w-24 required-label-after" htmlFor="last_name">
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
                        <label htmlFor="sex" className="required-label-after">Sex:</label>
                        <div className="flex flex-row gap-5 sex-group">
                            <div className="flex gap-2 male">
                                <input
                                    type="radio"
                                    name="sex"
                                    id="male"
                                    value="male"
                                    checked={formData.sex.toLowerCase() === "male"}
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
                                    value="female"
                                    checked={formData.sex.toLowerCase() === "female"}
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
                        <label htmlFor="birthdate" className="required-label-after">Date of Birth:</label>
                        <input
                            className="w-full border-gray-300 rounded-md border-[1px]"
                            type="date"
                            name="birthdate"
                            id="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
                            max={new Date().toISOString().split("T")[0]}
                            required
                        />
                        <p
                            id="birthdate-display"
                            className="mt-2 text-sm text-gray-600"
                        >
                            {formatDateForDisplay(formData.birthdate)}
                        </p>
                        {errors.birthdate && (
                            <span className="text-red-600">
                                {errors.birthdate}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="address" className="required-label-after">Address:</label>
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
                        <label htmlFor="appointment_date" className="required-label-after">
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
                        <p
                            id="appointment-date-display"
                            className="mt-2 text-sm text-gray-600"
                        >
                            {formatDateForDisplay(formData.appointment_date)}
                        </p>
                        {errors.appointment_date && (
                            <span className="text-red-600">
                                {errors.appointment_date}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="appointment_category_name" className="required-label-after">
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
                                        {appointmentCategories.map(({ category, is_available }) => (
                                            <option
                                                key={category.appointment_category_id}
                                                value={category.appointment_category_name}
                                                disabled={!is_available}
                                            >
                                                {category.appointment_category_name} 
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
                        <label htmlFor="email" className="required-label-after">Email:</label>
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
                        <label htmlFor="phone_number" className="required-label-after">Phone Number:</label>
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
                            className="absolute z-40 flex items-center justify-center w-full mt-2 mb-0"
                            id="recaptcha"
                        />
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
                    {isOpen && (
                        <OTPVerification
                            resendCountdown={resendCountdown}
                            isPending={isPending}
                            requestOtp={requestOtp}
                            verifyOTP={verifyOTP}
                            isOpen={isOpen}
                            toggleForm={toggleForm}
                            onVerified={bookAppointment}
                            formData={formData}
                            errors={errors}
                            isLoading={isLoading}
                            setFormData={setFormData}
                            phoneNumber={formData.phone_number}
                        />
                    )}
                </form>
            </div>
        </div>
    );
};

export default Appointment;
