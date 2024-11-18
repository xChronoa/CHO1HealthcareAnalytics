import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { User } from "../../types/User";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useEffect, useState } from "react";

const alert = withReactContent(Swal);

const AccountList: React.FC = () => {
    const { users, fetchUsers, disableUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, disableUser]);

    const handleUpdateClick = (user: User) => {
        navigate("/admin/manage/update", { state: { user } });
    };

    const handleDisable = async (user: User) => {
        const result = await alert.fire({
            title: "Are you sure?",
            text: "This will disable the account unless updated.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, disable it!",
            cancelButtonText: "No, cancel!",
            customClass: {
                confirmButton:
                    "bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700",
                cancelButton:
                    "bg-white  border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
            },
            buttonsStyling: false,
        });

        if (!result.isConfirmed) return;

        const userDisabled = await disableUser(user); 

        if (userDisabled) {
            alert.fire(
                "Account Disabled",
                "Successfully disabled the user account.",
                "success"
            );

            fetchUsers();
        } else {
            alert.fire(
                "Error",
                "An error occured while attempting to disable the user account.",
                "error"
            );
        }
    };

    const [currentPage, setCurrentPage] = useState<number>(1);
    const usersPerPage = 10;

    // Calculate the indices for slicing the appointments array
    const indexOfLastUsers = currentPage * usersPerPage;
    const indexOfFirstAppointment = indexOfLastUsers - usersPerPage;
    const currentUsers = users.slice(indexOfFirstAppointment, indexOfLastUsers);

    // Handle page change
    const totalPages = Math.ceil(users.length / usersPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <>
            <div className="container w-11/12 pt-6 pb-12">
                <header className="mb-4">
                    <h1 className="mb-2 text-2xl font-bold">Accounts List</h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>
                <section className="flex flex-col items-start">
                    <div className="w-full p-4 overflow-x-auto sm:py-4 table-container ">
                        <table className="hidden min-w-full text-xs text-center table-fixed lg:text-sm md:table">
                            {/* Table Header */}
                            <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                                <tr>
                                    <th className="px-4 py-2 rounded-l-[16px]">
                                        Role
                                    </th>
                                    <th className="px-4 py-2">
                                        Username
                                    </th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Barangay</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2 rounded-r-[16px]">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            {/* Table Contents */}
                            <tbody>
                                {currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user.user_id}>
                                            <td className="px-4 py-2 font-semibold uppercase align-center">
                                                {user.role}
                                            </td>
                                            <td className="px-4 py-2 font-semibold uppercase align-center">
                                                {user.username}
                                            </td>
                                            <td className="px-4 py-2 font-semibold uppercase align-center">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-2 font-semibold uppercase align-center">
                                                {user.barangay_name || "n/a"}
                                            </td>
                                            <td className={`px-4 py-2 font-semibold uppercase align-center ${user.status?.toLowerCase() === "disabled" ? "text-red-500" : "text-green"}`}>
                                                {user.status}
                                            </td>
                                            <td className="flex items-center justify-center gap-2 px-4 py-2 font-semibold uppercase align-center">
                                                {user.role === "encoder" ? (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateClick(user)
                                                            }
                                                            className="flex-1 p-2 text-white transition-all bg-blue-500 border-black rounded-lg shadow-md border-1 shadow-gray-400 hover:bg-blue-300 active:scale-95"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDisable(user)
                                                            }
                                                            className="flex-1 p-2 text-white transition-all bg-red-500 border-black rounded-lg shadow-md border-1 shadow-gray-400 disabled:opacity-50 disabled:scale-100 active:scale-95 hover:bg-red-300 disabled:hover:bg-red-500 disabled:cursor-not-allowed"
                                                            disabled={user?.status?.toLowerCase() === "disabled" || !user}
                                                        >
                                                            Disable
                                                        </button>
                                                    </>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-2 text-center"
                                        >
                                            <div className="w-full p-12 bg-white rounded-lg shadow-md col-span-full">
                                                <h1 className="text-center">
                                                    No users found.
                                                </h1>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile-friendly Card Layout */}
                        <div className="block md:hidden">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="p-4 mb-4 text-xs bg-white rounded-lg shadow-md sm:text-base outline outline-1 outline-black"
                                    >
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold">
                                                Role:
                                            </span>
                                            <span className="uppercase">{user.role}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold">
                                                Username:
                                            </span>
                                            <span>{user.username}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold">
                                                Email:
                                            </span>
                                            <span>{user.email}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold">
                                                Barangay:
                                            </span>
                                            <span>{user.barangay_name || "n/a"}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold">
                                                Status:
                                            </span>
                                            <span className={`${user.status?.toLowerCase() === "disabled" ? "text-red-500" : "text-green"}`}>{user.status}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {user.role === "encoder" ? (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleUpdateClick(user)
                                                        }
                                                        className="flex-1 p-2 text-white bg-blue-400 border-black rounded-lg shadow-md border-1 shadow-gray-400"
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDisable(user)
                                                        }
                                                        className="flex-1 p-2 text-white bg-red-600 border-black rounded-lg shadow-md border-1 shadow-gray-400"
                                                        disabled={user?.status?.toLowerCase() === "disabled" || !user}
                                                    >
                                                        Disable
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full p-12 bg-white rounded-lg shadow-md col-span-full">
                                    <h1 className="text-center">
                                        No users found.
                                    </h1>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-16 text-xs sm:justify-center sm:text-base">
                            {currentPage > 1 && (
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage <= 1}
                                    className="shadow-gray-400 shadow-md w-24 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green transition-all text-[.7rem] sm:text-sm text-white bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Previous
                                </button>
                            )}

                            {totalPages > 1 && (
                                <span className="px-4 py-2 text-center align-middle">
                                    Page {currentPage} of {totalPages}
                                </span>
                            )}

                            {currentPage < totalPages && (
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage >= totalPages}
                                    className="w-24 disabled:opacity-50 shadow-gray-400 shadow-md disabled:cursor-not-allowed disabled:hover:bg-green transition-all text-[.7rem] sm:text-sm text-white bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AccountList;
