import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useBarangay } from "../../hooks/useBarangay";
import { useUser } from "../../hooks/useUser";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import Swal from "sweetalert2";
import "../../styles/inputs.css";
import GeneratePasswordIcon from "../../components/GeneratePasswordIcon";

const CreateAccount: React.FC = () => {
    const { createUser, success, errorMessage, setErrorMessage } = useUser();
    const { barangays, fetchBarangays } = useBarangay();
    const [user, setUser] = useState<User>({
        username: "",
        password: "",
        email: "",
        role: "encoder",
        barangay_name: "",
    });
    const [redirecting, setRedirecting] = useState(false);
    const { isLoading } = useLoading();

    const hasErrors =
        errorMessage &&
        Object.values(errorMessage).some((value) => value !== "");

    const navigate = useNavigate();

    // Stores password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // Handles toggling of password visibility
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage({});

        // 1. Validate required fields
        const missingFields: string[] = [];
        const formFields = [
            { name: "username", value: user.username! },
            { name: "email", value: user.email! },
            { name: "password", value: user.password! },
            { name: "barangay_name", value: user.barangay_name! },
        ];

        // 2. Reset previous error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach((errorMessage) => {
            errorMessage.remove();
        });

        formFields.forEach((field) => {
            if (!field.value.trim()) {
                missingFields.push(field.name); // Collect names of incomplete fields
            }
        });

        if (missingFields.length > 0) {
            // 3. Scroll to first missing field
            const firstMissingField = document.getElementById(missingFields[0]);
            if (firstMissingField) {
                firstMissingField.scrollIntoView({ behavior: "smooth", block: "center" });
                firstMissingField.focus();
            }

            // 4. Show error message under the first missing field
            const firstField = document.getElementById(missingFields[0]);
            if (firstField) {
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'This field is required.';
                errorMessage.className = 'text-sm text-red-500 error-message'; // Styling the error message
                firstField.parentElement?.appendChild(errorMessage);
            }
            return; // Stop further processing
        }

        const result = await Swal.fire({
            title: "Create Account?",
            html: `
                <p class="mb-4">Are you sure you want to create this account?</p>
                <div class="border-2 border-black rounded-lg text-xs text-left p-4">
                    <div class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-3">
                        <span class="font-semibold">Username:</span>
                        <span>${user.username}</span>

                        <span class="font-semibold">Email:</span>
                        <span>${user.email}</span>

                        <span class="font-semibold">Password:</span>
                        <span class="break-words">${user.password}</span>

                        <span class="font-semibold">Barangay:</span>
                        <span class="break-words">${user.barangay_name}</span>
                    </div>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, create it!",
            cancelButtonText: "No, cancel!",
            customClass: {
                popup: "w-fit",
                title: "text-lg",
                confirmButton:
                    "transition-all bg-green text-white px-4 py-2 rounded-md hover:bg-[#009900]",
                cancelButton:
                    "transition-all bg-white border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
            },
            buttonsStyling: false,
            allowOutsideClick: false,  // Disable closing the modal by clicking outside
            allowEscapeKey: false,     // Disable closing the modal with the ESC key
            scrollbarPadding: false,
        });
        
        if (!result.isConfirmed) return;

        if (user === null) return;

        const createSuccess = await createUser(user);

        if (createSuccess) {
            if (!isLoading) {

                setUser({
                    username: "",
                    password: "",
                    email: "",
                    role: "encoder",
                    barangay_name: "",
                });
                
                Swal.fire({
                    title: "Account Created Successfully!",
                    html: "<p class='text-center break-words'>The new account has been created. Would you like to return to the accounts list or stay on this page?</p>",
                    icon: "success",
                    showCancelButton: true,
                    confirmButtonText: "Go to Accounts List",
                    cancelButtonText: "Stay Here",
                    customClass: {
                        title: "text-lg",
                        confirmButton:
                        "transition-all bg-green text-white px-4 py-2 rounded-md hover:bg-[#009900]",
                        cancelButton:
                        "transition-all bg-white border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
                    },
                    buttonsStyling: false,
                    scrollbarPadding: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        setRedirecting(true);
                        navigate("/admin/manage/accounts")
                    } else {
                        setRedirecting(false);
                    }
                });
            }
        }
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const generatePassword = () => {
        if(!showPassword) setShowPassword(true);
        
        const length = 12; // You can adjust the length as needed
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setUser((prevUser) => ({
            ...prevUser,
            password: password,
        }));
    };

    useEffect(() => {
        fetchBarangays();
    }, []);

    return (
        <div className="flex flex-col w-11/12 min-h-screen py-12">
            <header className="mb-4">
                <h1 className="mb-2 text-2xl font-bold">Manage Accounts</h1>
                <div className="w-full h-[2px] bg-black"></div>
            </header>
            <div className="flex items-center justify-center flex-1 w-full">
                <form 
                    className="w-11/12 sm:w-3/5 h-full p-8 bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-lg border border-gray-300 border-1"
                    onSubmit={handleSubmit}
                >
                    <h2 className="py-2 pb-4 text-2xl font-bold text-center uppercase">
                        Create Account
                    </h2>

                    {hasErrors && (
                        <div
                            className="flex items-center gap-2 p-4 mb-2 text-sm text-red-800 bg-red-100 rounded-lg"
                            role="alert"
                        >
                            <FontAwesomeIcon
                                icon={faCircleInfo}
                                className="color   -[#d66666]"
                            />
                            <span className="sr-only">Info</span>
                            <div>
                                {errorMessage.email && (
                                    <p>{errorMessage.email}</p>
                                )}
                                {errorMessage.username && (
                                    <p>{errorMessage.username}</p>
                                )}
                                {errorMessage.password && (
                                    <p>{errorMessage.password}</p>
                                )}
                                {errorMessage.barangay_name && (
                                    <p>{errorMessage.barangay_name}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {success && (
                        <div
                            className="flex items-center gap-2 p-4 mb-2 text-sm text-[#ffffff] bg-[#5cb85c] rounded-lg"
                            role="alert"
                        >
                            <FontAwesomeIcon
                                icon={faCircleInfo}
                                className="color-[#4a934a]"
                            />
                            <span className="sr-only">Info</span>
                            <div>
                                <p>Successfully created the account.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            className="bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={user.email}
                            onChange={handleChange}
                            placeholder="email@email.com"
                        />
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            className="bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                            type="text"
                            name="username"
                            id="username"
                            required
                            value={user.username}
                            onChange={handleChange}
                            placeholder="Username"
                        />
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="password">Password</label>

                        <div className="flex flex-row items-center w-full shadow-lg input">
                            <input
                                className="w-full bg-gray-100 border border-r-0 border-gray-300 rounded-lg rounded-r-none border-1"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                required
                                value={user.password}
                                onChange={handleChange}
                                placeholder="Password"
                                style={{ boxShadow: "none" }} // Correct inline style
                            />
                            <GeneratePasswordIcon 
                                className="cursor-pointer transition hover:bg-gray-200 py-[.63rem] px-3 border-gray-300 border bg-gray-100"
                                onClick={generatePassword} 
                            />
                            <div className="cursor-pointer flex justify-center items-center icon py-[.5rem] px-2 border-gray-300 border bg-gray-100 hover:bg-gray-200 transition" onClick={togglePassword}>
                                <FontAwesomeIcon
                                    
                                    icon={showPassword ? faEye : faEyeSlash}
                                    className="w-6 h-6 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="barangay_name" className="select-none">Barangay</label>
                        <select
                            className="py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-lg indent-2 border-1"
                            name="barangay_name"
                            id="barangay_name"
                            value={user.barangay_name}
                            onChange={handleChange}
                            required
                        >
                            {/* Can be replaced with the barangay values from the database */}
                            <option hidden>Select Barangay</option>
                            {isLoading ? (
                                <option disabled>Loading...</option>
                            ) : (
                                barangays.map((barangay) => (
                                    <option
                                        key={barangay.barangay_id}
                                        value={barangay.barangay_name}
                                    >
                                        {barangay.barangay_name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <button
                        className={`w-full p-2 my-5 font-bold text-white uppercase transition-all rounded-lg shadow-lg shadow-gray-400 bg-green hover:opacity-75 ${redirecting || isLoading ? "cursor-not-allowed" : ""}`}
                        type="submit"
                        disabled={redirecting || isLoading}
                    >
                        {redirecting
                            ? "Redirecting..."
                            : isLoading
                            ? "Creating..."
                            : "Create"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAccount;
