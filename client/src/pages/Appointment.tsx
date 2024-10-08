import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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
    const { fetchAppointmentCategories, appointmentCategories } =
        useAppointmentCategory();
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
    const [otpTimer, setOtpTimer] = useState<number>(60);
    const [otpTimerActive, setOtpTimerActive] = useState<boolean>(false);
    const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const requiredFields: Array<keyof FormData> = [
            "first_name",
            "last_name",
            "sex",
            "birthdate",
            "address",
            "appointment_date",
            "appointment_category_name",
            "email",
            "phone_number",
            "terms",
            "otp"
        ];

        requiredFields.forEach((field) => {
            const value = formData[field];
            if (field === "terms" && !value) {
                errors[field] = "You must accept the terms and conditions.";
            } else if (
                !value ||
                (typeof value === "string" && value.trim() === "")
            ) {
                errors[field] =
                    "This field cannot be empty or just whitespace.";
            }
        });

        return errors;
    };

    useEffect(() => {
        fetchAppointmentCategories();
    }, [fetchAppointmentCategories]);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (otpTimerActive && otpTimer > 0) {
            timer = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        } else if (otpTimer <= 0) {
            setOtpTimerActive(false);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [otpTimer, otpTimerActive]);

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

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setErrors({});
        setValidationErrors({});
        setGeneralError(null);

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors(validationErrors);

            // Convert validation errors to a readable format with HTML
            const fieldLabels: { [key: string]: string } = {
                first_name: "First Name",
                last_name: "Last Name",
                sex: "Sex",
                birthdate: "Birthdate",
                address: "Address",
                appointment_date: "Appointment Date",
                appointment_category_name: "Appointment Category",
                email: "Email",
                phone_number: "Phone Number",
                otp: "OTP",
                patient_note: "Patient Note",
                terms: "Terms",
            };

            const errorMessages = Object.entries(validationErrors)
                .map(([field, errors]) => {
                    const fieldName = fieldLabels[field] || field;
                    return `<p><strong>${fieldName}:</strong> ${errors}</p>`;
                })
                .join("");

            Swal.fire({
                title: "Validation Errors",
                html: `
                    <div style="
                        font-size: 16px;
                        line-height: 1.5;
                        max-height: 300px;
                        overflow-y: auto;
                        padding: 10px;
                    ">
                        Please fix the following errors:<br>${errorMessages}
                    </div>
            `,
                icon: "error",
                confirmButtonText: "OK",
            });

            return;
        }

        // if (!(await verifyOTP())) {
        //     setGeneralError("Invalid OTP. Please try again.");
        //     return;
        // }

        try {
            setLoading(true);
            const response = await fetch(`${baseAPIUrl}/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.errors) {
                    setErrors(data.errors);
                    Swal.fire({
                        title: "Error",
                        text: "There was an issue with your submission. Please check the errors and try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                } else {
                    setGeneralError("An unexpected error occurred.");
                    Swal.fire({
                        title: "Error",
                        text: "An unexpected error occurred. Please try again later.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } else {
                const result = await response.json();
                const patientDetails = {
                    ...formData,
                    queue_number: result.queue_number,
                };

                // Store appointment details in sessionStorage
                sessionStorage.setItem(
                    "appointmentDetails",
                    JSON.stringify(patientDetails)
                );

                // Show SweetAlert notification
                Swal.fire({
                    title: "Appointment Confirmed!",
                    text: "Your appointment has been successfully booked.",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    // Redirect to confirmation page
                    navigate("/appointment/confirmation");
                });
            }
        } catch (error) {
            setGeneralError("An error occurred while submitting the form.");
            Swal.fire({
                title: "Error",
                text: "An error occurred while submitting the form. Please try again later.",
                icon: "error",
                confirmButtonText: "OK",
            });
            console.error("An error occurred:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneNumberChange = (value: string | undefined) => {
        setFormData((prev) => ({
            ...prev,
            phone_number: value || "",
        }));
    };

    const sendOTP = async () => {
        if (!formData.phone_number) {
            return;
        }

        try {
            const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
            const confirmation = await signInWithPhoneNumber(
                auth,
                formData.phone_number,
                recaptcha
            );
            setConfirm(confirmation);
            setOtpTimer(60); // Reset timer to 60 seconds
            setOtpTimerActive(true); // Start timer
        } catch (error) {
            console.error(error);
        }
    };

    const verifyOTP = async (): Promise<boolean> => {
        try {
            if (!confirm) {
                throw new Error("No confirmation result available.");
            }

            // Confirm the OTP
            const result = await confirm.confirm(formData.otp);

            // Handle successful OTP verification
            if (result) {
                // OTP is valid
                return true;
            } else {
                // OTP is invalid or not confirmed
                return false;
            }
        } catch (error) {
            // Handle errors (invalid OTP, network issues, etc.)
            setGeneralError("Invalid OTP. Please try again.");
            return false;
        }
    };

    const [minDate, setMinDate] = useState<string>("");

    // Calculate tomorrow's date
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const dd = String(tomorrow.getDate()).padStart(2, "0");
        setMinDate(`${yyyy}-${mm}-${dd}`);
    }, []);

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
                    className="flex flex-col justify-center w-full p-5 mt-2 mb-16 border-2 border-black rounded sm:w-3/4"
                    onSubmit={handleSubmit}
                >
                    <div className="flex flex-row flex-wrap gap-5 mb-3 input-group lg:flex-nowrap">
                        <div className="flex items-center w-full gap-2 first-name">
                            <label className="min-w-24" htmlFor="first_name">
                                First Name:
                            </label>
                            <input
                                className="w-full"
                                type="text"
                                name="first_name"
                                id="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.first_name && (
                                <span className="text-red-600">
                                    {errors.first_name}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center w-full gap-2 last-name">
                            <label className="min-w-24" htmlFor="last_name">
                                Last Name:
                            </label>
                            <input
                                className="w-full"
                                type="text"
                                name="last_name"
                                id="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                            {errors.last_name && (
                                <span className="text-red-600">
                                    {errors.last_name}
                                </span>
                            )}
                        </div>
                    </div>

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
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="birthdate">Date of Birth:</label>
                        <input
                            className="w-full"
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
                            className="w-full"
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
                            className="p-2"
                            name="appointment_category_name"
                            id="appointment_category_name"
                            value={formData.appointment_category_name}
                            onChange={handleChange}
                            required
                        >
                            <option hidden>Select Type</option>
                            {appointmentCategories.map((category) => (
                                <option
                                    key={category.appointment_category_id}
                                    value={category.appointment_category_name}
                                >
                                    {category.appointment_category_name}
                                </option>
                            ))}
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
                            className=""
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Your Email Address"
                            value={formData.email}
                            onChange={handleChange}
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
                        ></div>
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <button
                            type="button"
                            onClick={sendOTP}
                            disabled={otpTimerActive}
                            className="px-4 py-2 text-white transition-all rounded bg-green hover:opacity-75"
                        >
                            {otpTimerActive
                                ? `Send OTP (${otpTimer}s)`
                                : "Send OTP"}
                        </button>
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="otp">OTP:</label>
                        <input
                            type="text"
                            name="otp"
                            id="otp"
                            placeholder="Enter OTP"
                            value={formData.otp}
                            onChange={handleChange}
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
                            className="p-2"
                        />
                        {errors.patient_note && (
                            <span className="text-red-600">
                                {errors.patient_note}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-row items-center justify-center my-2 terms">
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
                                    <span className="text-green">
                                        Terms of Use
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-green">
                                        Privacy Policy
                                    </span>{" "}
                                    and I declare that I have read the
                                    Information that is required in accordance
                                    with{" "}
                                    <span className="text-green">
                                        RA 1073 (Data Privacy Act of 2012)
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
                        className="p-2 my-5 font-bold text-white uppercase transition-all rounded-lg shadow-xl bg-green hover:opacity-75"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Appointment;
