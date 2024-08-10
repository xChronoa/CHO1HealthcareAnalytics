import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const CreateAccount: React.FC = () => {
    // Stores password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // Handles toggling of password visibility
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex flex-col w-11/12 min-h-screen py-16">
            <header className="mb-4">
                <h1 className="mb-2 text-2xl font-bold">Manage Accounts</h1>
                <div className="w-full h-[2px] bg-black"></div>
            </header>
            <div className="flex items-center justify-center flex-1 w-full">
                <form className="w-11/12 sm:w-3/5 h-full p-8 bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-lg border border-gray-300 border-1">
                    <h2 className="py-2 pb-4 text-2xl font-bold text-center uppercase">
                        Create Account
                    </h2>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            className="bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                            type="text"
                            name="email"
                            id="email"
                            required
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
                        />
                    </div>

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="password">Password</label>

                        <div className="relative w-full input">
                            <input
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
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

                    <div className="flex flex-col mb-3 input-group">
                        <label htmlFor="barangay">Barangay</label>
                        <select
                            className="py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-lg indent-2 border-1"
                            name="barangay"
                            id="barangay"
                            required
                        >
                            {/* Can be replaced with the barangay values from the database */}
                            <option hidden>Select Barangay</option>
                            <option value="bigaa">Bigaa</option>
                            <option value="butong">Butong</option>
                            <option value="gulod">Gulod</option>
                            <option value="marinig">Marining</option>
                            <option value="niugan">Niugan</option>
                            <option value="poblacion-uno">Poblacion Uno</option>
                            <option value="poblacion-dos">Poblacion Dos</option>
                            <option value="poblacion-tres">
                                Poblacion Tres
                            </option>
                            <option value="sala">Sala</option>
                        </select>
                    </div>

                    <button
                        className="w-full p-2 my-5 font-bold text-white uppercase transition-all rounded-lg shadow-lg shadow-gray-400 bg-green hover:opacity-75"
                        type="submit"
                    >
                        Create
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAccount;
