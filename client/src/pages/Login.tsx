import Header from "../components/Header";
import Footer from "../components/Footer";
import cabuyao_logo from "../assets/cabuyao_logo.png";
import hide_password from "../assets/hide_password.png";
import show_password from "../assets/show_password.png";
import { useState } from "react";

export default function Login() {
    // Stores password visibility state
    const [showPassword, setShowPassword] = useState(false);
    const [passwordState, setPasswordState] = useState(hide_password);
    
    // Handles toggling of password visibility
    const togglePassword = () => {
        setShowPassword(!showPassword);

        if(passwordState.includes(hide_password)) {
            setPasswordState(show_password);
        } else {
            setPasswordState(hide_password);
        }
    }

    return(
        <>
            <Header />

            <main className="bg-slate-200 min-h-screen flex justify-center items-center">

                <div className="login-container h-3/4 w-11/12 md:w-1/2 bg-white py-16 min-w-80 shadow-2xl">
                    <div className="title flex flex-col justify-center items-center gap-5 mb-8">
                        <img className="min-w-max size-50 md:size-60 transition-all size-44" src={cabuyao_logo} alt="City of Cabuyao Logo" />
                        <h2 className="text-black font-bold text-2xl uppercase">login</h2>
                    </div>

                    <form className="flex flex-col justify-center items-center">
                        <div className="form-wrapper w-4/5 flex flex-col gap-5">
                            {/* Username */}
                            <div className="input-group flex flex-col">
                                <label htmlFor="username">Username</label>
                                <input className="bg-gray-100 px-4 py-2 shadow-xl" type="text" name="username" id="username" placeholder="Username or Email" required/>
                            </div>

                            {/* Password */}
                            <div className="input-group flex flex-col">
                                <label htmlFor="password">Password</label>

                                <div className="input w-full relative">
                                    <input className="w-full px-4 py-2 pr-12 bg-gray-100 shadow-xl" type={showPassword ? "text" : "password"} name="password" id="password" placeholder="Must be 8 characters long" required/>
                                    <img onClick={togglePassword} src={passwordState} id="toggle-password" onContextMenu={(e) => e.preventDefault()} className="absolute right-2 top-1 size-8 hover:cursor-pointer hover:scale-95 transition-all"/>
                                </div>
                            </div>

                            <button type="submit" className="bg-green text-white font-bold uppercase rounded-lg shadow-lg w-full mt-5 py-2">login</button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </>
    );
}