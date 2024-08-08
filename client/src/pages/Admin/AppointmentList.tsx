const AppointmentList: React.FC = () => {
    return (
        <div className="w-11/12 py-16">
            <header className="mb-4 ">
                <h1 className="mb-2 text-2xl font-bold">Patient Appointments</h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>
            <section className="flex flex-col items-start">
                <div className="flex flex-row items-center justify-end w-full gap-10 mt-6 mb-5 sm:mb-0 filter">
                    {/* Filter by month and year */}
                    <div className="relative flex flex-row items-center justify-center gap-2">
                        <label htmlFor="date" className="absolute left-0 top-[-1.5rem] font-medium">Appointment Date</label>
                        <input
                            className="p-1 py-1.5 text-center bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                            type="date"
                            name="date"
                            id="date"
                        />
                    </div>

                    <div className="flex flex-row items-center justify-center gap-5">
                        <select
                                className="px-2 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                                name="barangay"
                                id="barangay"
                                required
                            >
                            <option hidden>Select Category</option>
                            <option value="">1</option>
                            <option value="">2</option>
                            <option value="">3</option>
                            <option value="">4</option>
                            <option value="">5</option>
                        </select>
                    </div>
                </div>

                <div className="w-full p-4 overflow-x-auto rounded-lg shadow-md sm:py-4 table-container outline outline-1 shadow-black sm:outline-0 sm:shadow-transparent">
                    <table className="w-full text-center">
                        {/* Table Header */}    
                        <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                            <tr>
                                <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">Name</th>
                                <th className="px-4 py-2">Sex</th>
                                <th className="px-4 py-2">Birthdate</th>
                                <th className="px-4 py-2">Address</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Phone#</th>
                                <th className="px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        {/* Table Contents */}
                        <tbody>
                            {/* Dummy Data */}
                            <tr>
                                <td className="px-4 py-2 font-semibold uppercase">John Doe</td>
                                <td className="px-4 py-2 font-semibold uppercase">Male</td>
                                <td className="px-4 py-2 font-semibold uppercase">November 1, 2000</td>
                                <td className="px-4 py-2 font-semibold uppercase">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolor pariatur nulla similique quis dolorum sit distinctio autem. Soluta, numquam! Quidem?</td>
                                <td className="px-4 py-2 font-semibold uppercase">emailemailemailemailemailemail@email.email</td>
                                <td className="px-4 py-2 font-semibold uppercase">0123 456 7890</td>
                                <td className="px-4 py-2 font-semibold uppercase">01:00 PM</td>
                            </tr>
                            
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AppointmentList;