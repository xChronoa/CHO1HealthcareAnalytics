import { Link, useNavigate } from "react-router-dom";

interface SuccessNewPasswordProps {
    role: string;
}

const SuccessNewPassword: React.FC<SuccessNewPasswordProps> = ({
    role
}) => {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        // Navigate based on role
        if (role.startsWith("admin")) {
            navigate("/admin/login");
        } else if (role === "encoder") {
            navigate("/barangay/login");
        } else {
            navigate("/"); // Default route if role doesn't match
        }
    };

    return (
        <div className="relative w-full max-w-md max-h-full p-4">
            <div className="relative bg-white rounded-lg shadow">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Successfully changed password
                    </h3>
                    <button
                        type="button"
                        onClick={handleLoginRedirect}
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
                            Your password has been successfully updated.
                        </p>
                        <p>
                            You can now use your new password to log in to your
                            account securely.
                        </p>
                    </div>
                    <div className="flex justify-between gap-2">
                        <Link
                            to={role.startsWith("admin") ? "/admin/login" : role === "encoder" ? "/barangay/login" : "/"}
                            className="transition-all text-[.7rem] sm:text-sm text-white w-full bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Continue to Login
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SuccessNewPassword;
