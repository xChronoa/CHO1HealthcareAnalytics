import { useState } from "react";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

interface SearchEmailProps {
    setStep: (step: number) => void;
    goHome: () => void;
}

const SearchEmail: React.FC<SearchEmailProps> = ({ setStep, goHome }) => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { incrementLoading, decrementLoading } = useLoading();

    const handleSearch = async () => {
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/auth/search/email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
    
            if (response.ok) {
                localStorage.setItem("email", email);
                setStep(2);
            } else {
                const data = await response.json();
                setError(data.error || "Email not found.");
            }
        } catch (error) {
            setError("Unable to search email. Please try again later.");
        } finally {
            decrementLoading();
        }
    };
    

    return (
        <div className="relative w-full max-w-md max-h-full p-4">
            <div className="relative bg-white rounded-lg shadow">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5">
                    <h3 className="text-lg font-semibold text-gray-900 ">
                        Find your account
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
                            Enter the email, phone number, or username
                            associated with your account to change your
                            password.
                        </p>
                        <div className="relative z-0 w-full mt-5 mb-5 group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                name="floating_email"
                                id="floating_email"
                                className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                placeholder=" "
                                required
                            />
                            <label
                                htmlFor="floating_email"
                                className="peer-focus:font-medium absolute text-sm text-gray-500  duration-300 -translate-y-8 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8"
                            >
                                Email address
                            </label>
                            {error && <p className="text-red-500">{error}</p>}
                        </div>
                    </div>
                    <div className="flex justify-between gap-2">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="transition-all text-[.7rem] sm:text-sm text-white w-full bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                        >
                            Next
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SearchEmail;
