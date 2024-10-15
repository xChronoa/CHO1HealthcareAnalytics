import { useState } from "react";

import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";

// For specifying the logo to be displayed based on inputted department.
type LoginProp = {
    image: string;
};

const Login: React.FC<LoginProp> = ({ image }) => {
    const { user, authenticated, login, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { isLoading } = useLoading();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    // Stores password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // Handles toggling of password visibility
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    // Redirect if the user is already authenticated
    if (user && authenticated) {
        const redirectPath = user.role === "admin" ? "/admin" : "/barangay";
        return <Navigate to={redirectPath} />;
    }

    return (
        <div className="flex items-center justify-center w-full min-h-screen bg-slate-200">
            <div className="w-11/12 py-16 bg-white shadow-2xl sm:w-[512px] login-container min-w-80">
                <div className="flex flex-col items-center justify-center gap-5 mb-8 title">
                    <img
                        className="transition-all min-w-max size-50 md:size-60 size-44"
                        src={image}
                        alt="City of Cabuyao Logo"
                        loading="lazy"
                    />
                    <h2 className="text-2xl font-bold text-black uppercase">
                        login
                    </h2>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center justify-center"
                >
                    <div className="flex flex-col w-4/5 gap-5 form-wrapper">
                        {error && (
                            <div
                                className="flex items-center gap-2 p-4 mb-0 text-sm text-red-800 bg-red-100 rounded-lg"
                                role="alert"
                            >
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="color   -[#d66666]"
                                />
                                <span className="sr-only">Info</span>
                                <div>
                                    {error}
                                </div>
                            </div>
                        )}
                        {/* Username */}
                        <div className="flex flex-col input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                className="px-4 py-2 bg-gray-100 shadow-xl border-gray-300 rounded-md border-[1px]"
                                type="text"
                                name="username"
                                id="username"
                                placeholder="Username or Email"
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col input-group">
                            <label htmlFor="password">Password</label>

                            <div className="relative w-full input">
                                <input
                                    className="w-full px-4 py-2 pr-12 bg-gray-100 shadow-xl border-gray-300 rounded-md border-[1px]"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    placeholder="Must be 8 characters long"
                                    required
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete=""
                                />
                                {showPassword ? (
                                    <FontAwesomeIcon
                                        onClick={togglePassword}
                                        icon={faEye}
                                        className="absolute transition-all right-2 top-1 size-8 hover:cursor-pointer hover:scale-95"
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        onClick={togglePassword}
                                        icon={faEyeSlash}
                                        className="absolute transition-all right-2 top-1 size-8 hover:cursor-pointer hover:scale-95"
                                    />
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 mt-5 font-bold text-white uppercase rounded-lg shadow-lg bg-green"
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
