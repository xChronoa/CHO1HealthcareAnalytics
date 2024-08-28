import { useUser } from "../../hooks/useUser";
import Loading from "../../components/Loading";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { useNavigate } from "react-router-dom";
import { User } from "../../types/User";

const AccountList: React.FC = () => {
    const { users, fetchUsers, loading } = useUser();
    const navigate = useNavigate();

    useEffectAfterMount(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdateClick = (user: User) => {
        navigate("/admin/manage/update", { state: { user } });
    };

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="mb-4 ">
                    <h1 className="mb-2 text-2xl font-bold">Manage Accounts</h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>
                <section className="flex flex-col items-start">
                    <div className="w-full p-4 overflow-x-auto rounded-lg shadow-md sm:py-4 table-container outline outline-1 shadow-black sm:outline-0 sm:shadow-transparent">
                        <table className="min-w-full text-center table-fixed">
                            {/* Table Header */}
                            <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">
                                        Username
                                    </th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Barangay</th>
                                    <th className="px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">Action</th>
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
                                                {user.barangay_name}
                                            </td>
                                            <td className="flex items-center justify-center gap-2 px-4 py-2 font-semibold uppercase align-top">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateClick(user)
                                                    }
                                                    className="p-2 text-white bg-blue-400 border-black rounded-lg shadow-md border-1 shadow-gray-400"
                                                >
                                                    Update
                                                </button>
                                                {user.role === "encoder" ? (
                                                    <button className="p-2 text-white bg-red-600 border-black rounded-lg shadow-md border-1 shadow-gray-400">
                                                        Disable
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-2 text-center"
                                        >
                                            No users.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {loading && <Loading />}
        </>
    );
};

export default AccountList;
