import { useUser } from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { User } from "../../types/User";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useEffect } from "react";

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

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="mb-4">
                    <h1 className="mb-2 text-2xl font-bold">Manage Accounts</h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>
                <section className="flex flex-col items-start">
                    <div className="w-full p-4 overflow-x-auto sm:py-4 table-container ">
                        <table className="hidden min-w-full text-xs text-center table-fixed lg:text-sm md:table">
                            {/* Table Header */}
                            <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">
                                        Username
                                    </th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Barangay</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            {/* Table Contents */}
                            <tbody>
                                {users ? (
                                    users.map((user) => (
                                        <tr key={user.user_id}>
                                            <td className="px-4 py-2 font-semibold uppercase align-top">
                                                {user.username}
                                            </td>
                                            <td className="px-4 py-2 font-semibold uppercase align-top">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-2 font-semibold uppercase align-top">
                                                {user.barangay_name || "n/a"}
                                            </td>
                                            <td className={`px-4 py-2 font-semibold uppercase align-top ${user.status?.toLowerCase() === "disabled" ? "text-red-500" : "text-green"}`}>
                                                {user.status}
                                            </td>
                                            <td className="flex items-center justify-center gap-2 px-4 py-2 font-semibold uppercase align-top">
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
                                            colSpan={5}
                                            className="px-4 py-2 text-center"
                                        >
                                            No users.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Mobile-friendly Card Layout */}
                        <div className="block md:hidden">
                            {users ? (
                                users.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="p-4 mb-4 bg-white rounded-lg shadow-md outline outline-1 outline-black"
                                    >
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
                                                    >
                                                        Disable
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center">No users.</div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AccountList;
