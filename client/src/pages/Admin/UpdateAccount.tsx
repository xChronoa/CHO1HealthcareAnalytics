import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { User } from "../../types/User";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { useBarangay } from "../../hooks/useBarangay";
import { useUser } from "../../hooks/useUser";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { useLoading } from "../../context/LoadingContext";
import Swal from "sweetalert2";

const UpdateAccount: React.FC = () => {
    const location = useLocation();
    const { getUser, updateUser, success, errorMessage } = useUser();
    const { fetchBarangays, barangays} = useBarangay();
    const [user, setUser] = useState<User>(location.state?.user);
    const [redirecting, setRedirecting] = useState(false);
    const { isLoading } = useLoading();

    const hasErrors =
        errorMessage &&
        Object.values(errorMessage).some((value) => value !== "");

    const navigate = useNavigate();

    useEffectAfterMount(async () => {
        if (!user || user.user_id === undefined) return;

        const userData = await getUser(user.user_id);

        if (userData || userData !== undefined) {
            setUser(userData);
        }

        if(user.role === "encoder") {
            fetchBarangays();
        }
    }, []);

    // Stores password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // Handles toggling of password visibility
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Are you sure you want to update this account?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, update it!",
            cancelButtonText: "No, cancel!",
            customClass: {
                popup: "w-fit",
                title: "text-lg",
                confirmButton:
                    "transition-all bg-blue-400 text-white px-4 py-2 rounded-md hover:opacity-75",
                cancelButton:
                    "transition-all bg-white border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
            },
            buttonsStyling: false,
        });

        if (!result.isConfirmed) return false;

        if (user === null) return;

        const updateSuccess = await updateUser(user);

        if (updateSuccess) {
            if (!isLoading) {
                setRedirecting(true);
                setUser({
                    username: "",
                    password: "",
                    email: "",
                    barangay_name: "",
                    status: "",
                });
                navigate("/admin/manage/accounts");
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

    return (
        <>
            <div className="flex flex-col w-11/12 min-h-screen py-16">
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
                            Update Account
                        </h2>

                        {hasErrors && (
                            <div
                                className="flex items-center gap-2 p-4 mb-2 text-sm text-red-800 bg-red-100 rounded-lg"
                                role="alert"
                            >
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="color-[#d66666]"
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
                                    <p>Successfully updated user's details.</p>
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

                            <div className="relative w-full input">
                                <input
                                    className="w-full bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    value={user.password || ""}
                                    onChange={handleChange}
                                    placeholder="Password"
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

                        {user.role === "encoder" ? (
                            <div className="flex flex-col mb-3 input-group">
                                <label htmlFor="barangay_name">Barangay</label>
                                <select
                                    className="py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-lg indent-2 border-1"
                                    name="barangay_name"
                                    id="barangay_name"
                                    required
                                    value={user.barangay_name || ""}
                                    onChange={handleChange}
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
                        ) : null}

                        <div className="flex flex-col mb-3 input-group">
                            <label htmlFor="status">Status</label>
                            <select
                                className="py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-lg indent-2 border-1"
                                name="status"
                                id="status"
                                value={user.status}
                                onChange={handleChange}
                                required
                            >
                                <option hidden>Select Status</option>
                                <option value="active">Active</option>
                                <option value="disabled">Disabled</option>
                            </select>
                        </div>

                        <button
                            className="w-full p-2 my-5 font-bold text-white uppercase transition-all bg-blue-400 rounded-lg shadow-lg shadow-gray-400 hover:opacity-75"
                            type="submit"
                        >
                            {redirecting
                                ? "Redirecting..."
                                : isLoading
                                ? "Updating..."
                                : "Update"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UpdateAccount;
