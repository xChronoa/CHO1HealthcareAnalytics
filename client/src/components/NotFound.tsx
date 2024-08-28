import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="text-black bg-gradient-to-r from-slate-200 to-gray-200 dark:from-gray-800 dark:to-gray-900 dark:text-white">
            <div className="flex items-center justify-center min-h-screen px-2">
                <div className="text-center">
                    <h1 className="font-bold text-9xl">404</h1>
                    <p className="mt-4 text-2xl font-medium">
                        Oops! Page not found
                    </p>
                    <p className="mt-4 mb-8">
                        The page you're looking for doesn't exist or has been
                        moved.
                    </p>
                    <a
                        onClick={() => {
                            navigate(-1);
                        }}
                        className="relative z-50 px-6 py-3 font-semibold transition duration-300 ease-in-out bg-white rounded-full cursor-pointer hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
