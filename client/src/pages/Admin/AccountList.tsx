const AccountList: React.FC = () => {
    return (
        <div className="w-11/12 py-16">
            <header className="mb-4 ">
                <h1 className="mb-2 text-2xl font-bold">Manage Accounts</h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>
            <section className="flex flex-col items-start">
                <div className="w-full p-4 overflow-x-auto rounded-lg shadow-md sm:py-4 table-container outline outline-1 shadow-black sm:outline-0 sm:shadow-transparent">
                    <table className="w-full text-center table-fixed">
                        {/* Table Header */}    
                        <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                            <tr>
                                <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">Username</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Barangay</th>
                                <th className="px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        {/* Table Contents */}
                        <tbody>
                            {/* Dummy Data */}
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase align-top">username</td>
                                <td className="px-4 py-2 font-semibold uppercase align-top">email</td>
                                <td className="px-4 py-2 font-semibold uppercase align-top">barangay</td>
                                <td className="flex items-center justify-center gap-2 px-4 py-2 font-semibold uppercase align-top">
                                    <button className="p-2 text-white bg-blue-400 border-black rounded-lg shadow-md border-1 shadow-gray-400">
                                        Update
                                    </button>
                                    <button className="p-2 text-white bg-red-600 border-black rounded-lg shadow-md border-1 shadow-gray-400">
                                        Disable
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase align-top">username</td>
                                <td className="px-4 py-2 font-semibold uppercase align-top">email</td>
                                <td className="px-4 py-2 font-semibold uppercase align-top">barangay</td>
                                <td className="flex items-center justify-center gap-2 px-4 py-2 font-semibold uppercase align-top">
                                    <button className="p-2 text-white bg-blue-400 border-black rounded-lg shadow-md border-1 shadow-gray-400">
                                        Update
                                    </button>
                                    <button className="p-2 text-white bg-red-600 border-black rounded-lg shadow-md border-1 shadow-gray-400">
                                        Disable
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase align-top">username</td>
                                <td className="px-4 py-2 font-semibold uppercase align-top">email</td>
                                <td className="px-4 py-2 font-semibold uppercase align-top">barangay</td>
                                <td className="flex items-center justify-center gap-2 px-4 py-2 font-semibold uppercase align-top">
                                    <button className="p-2 text-white bg-blue-400 border-black rounded-lg shadow-md border-1 shadow-gray-400">
                                        Update
                                    </button>
                                    <button className="p-2 text-white bg-red-600 border-black rounded-lg shadow-md border-1 shadow-gray-400">
                                        Disable
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AccountList;