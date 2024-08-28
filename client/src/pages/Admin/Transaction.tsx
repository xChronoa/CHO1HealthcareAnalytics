const Transaction: React.FC = () => {
    return (
        <div className="w-11/12 py-16">
            <header className="mb-4 ">
                <h1 className="mb-2 text-2xl font-bold">Transaction</h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>
            <section className="flex flex-col items-start">
                <div className="flex flex-col items-center justify-between w-full gap-6 mb-6 md:gap-0 md:flex-row filter">
                    {/* Filter by month and year */}
                    <div className="flex flex-row items-center justify-center gap-5">
                        <label htmlFor="month-from">From:</label>
                        <input
                            className="p-1 text-center rounded-lg"
                            type="month"
                            name="month-from"
                            id="month-from"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-row items-center justify-center gap-5">
                        <button
                            className="w-24 py-2 text-white bg-green"
                            type="button"
                        >
                            All
                        </button>
                        <button
                            className="w-24 py-2 text-white bg-green"
                            type="button"
                        >
                            Pending
                        </button>
                        <button
                            className="w-24 py-2 text-white bg-green"
                            type="button"
                        >
                            Received
                        </button>
                    </div>
                </div>
                <div className="w-full table-container">
                    <table className="w-full text-center">
                        {/* Table Header */}
                        <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                            <tr>
                                <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">
                                    Barangay
                                </th>
                                <th className="px-4 py-2">Date Submitted</th>
                                <th className="px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        {/* Table Contents */}
                        <tbody>
                            {/* Dummy Data */}
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    Bigaa
                                </td>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    March 08, 2024
                                </td>
                                <td className="px-4 py-2 font-semibold text-red-600 uppercase">
                                    Pending
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    Bigaa
                                </td>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    March 08, 2024
                                </td>
                                <td className="px-4 py-2 font-semibold text-red-600 uppercase">
                                    Pending
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    Bigaa
                                </td>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    March 08, 2024
                                </td>
                                <td className="px-4 py-2 font-semibold text-red-600 uppercase">
                                    Pending
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    Bigaa
                                </td>
                                <td className="px-4 py-2 font-semibold uppercase">
                                    March 08, 2024
                                </td>
                                <td className="px-4 py-2 font-semibold text-red-600 uppercase">
                                    Pending
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Transaction;
