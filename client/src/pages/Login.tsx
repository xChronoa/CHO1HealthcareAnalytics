import { useState } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

import cabuyao_logo from "../assets/cabuyao_logo.png";

import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// For specifying the logo to be displayed based on inputted department.
type LoginProp = {
    image: string;
};

export default function Login({ image }: LoginProp) {
    // Stores password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // Handles toggling of password visibility
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Header logoPath={cabuyao_logo} />

            <main className="flex items-center justify-center min-h-screen bg-slate-200">
                <div className="w-11/12 py-16 bg-white shadow-2xl sm:w-[512px] login-container min-w-80">
                    <div className="flex flex-col items-center justify-center gap-5 mb-8 title">
                        <img
                            className="transition-all min-w-max size-50 md:size-60 size-44"
                            src={image}
                            alt="City of Cabuyao Logo"
                        />
                        <h2 className="text-2xl font-bold text-black uppercase">
                            login
                        </h2>
                    </div>

                    <form className="flex flex-col items-center justify-center">
                        <div className="flex flex-col w-4/5 gap-5 form-wrapper">
                            {/* Username */}
                            <div className="flex flex-col input-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    className="px-4 py-2 bg-gray-100 shadow-xl"
                                    type="text"
                                    name="username"
                                    id="username"
                                    placeholder="Username or Email"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col input-group">
                                <label htmlFor="password">Password</label>

                                <div className="relative w-full input">
                                    <input
                                        className="w-full px-4 py-2 pr-12 bg-gray-100 shadow-xl"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        id="password"
                                        placeholder="Must be 8 characters long"
                                        required
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
                                login
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </>
    );
}
