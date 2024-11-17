import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="text-gray-900 bg-gradient-to-r from-white to-gray-100">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center">
                    <h1 className="font-bold text-gray-900 text-9xl">404</h1>
                    <p className="mt-4 text-2xl font-medium text-gray-700">
                        Oops! Page not found
                    </p>
                    <p className="mt-4 mb-8 text-gray-600">
                        The page you're looking for doesn't exist or has been
                        moved.
                    </p>
                    <a
                        onClick={() => {
                            const from = sessionStorage.getItem("from");

                            if (from) {
                                // If 'from' exists in sessionStorage, navigate to the stored path
                                sessionStorage.removeItem("from");
                                navigate(from);
                            } else {
                                // Otherwise, go back to the previous page in the history stack
                                navigate(-1);
                            }
                        }}
                        className="relative z-50 px-6 py-3 font-semibold text-gray-900 transition duration-300 ease-in-out bg-gray-200 border-2 border-gray-300 rounded-full shadow-lg cursor-pointer shadow-gray-400 hover:bg-gray-300"
                    >
                        Go Back
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
