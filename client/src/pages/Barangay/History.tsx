const History: React.FC = () => {
    return (
        <div className="w-11/12 py-16">
            <header className="mb-4 ">
                <h1 className="mb-2 text-2xl font-bold">
                    Submittals History
                </h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>
            <section className="flex flex-col items-start">
                {/* Filter by month and year */}
                <div className="mb-4">
                    <select className="px-2 py-1 border rounded-md">
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        {/* Add more options as needed */}
                    </select>
                </div>
                <div className="w-full table-container">
                    <table className="w-full text-center">
                        {/* Table Header */}
                        <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                            <tr>
                                <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">
                                    Name of Report
                                </th>
                                <th className="px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">
                                    Date Submitted
                                </th>
                            </tr>
                        </thead>
                        {/* Table Contents */}
                        <tbody>
                            {/* Dummy Data */}
                            <tr>
                                <td className="px-4 py-2">M1 Report</td>
                                <td className="px-4 py-2">
                                    March 08, 2024
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">M2 Report</td>
                                <td className="px-4 py-2">
                                    March 08, 2024
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default History;