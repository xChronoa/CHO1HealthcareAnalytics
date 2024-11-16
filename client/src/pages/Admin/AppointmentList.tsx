import { useEffect, useState } from "react";
import { useAppointmentCategory } from "../../hooks/useAppointmentCategory";
import { useAppointment } from "../../hooks/useAppointment"; // Hook for fetching appointments

const AppointmentList: React.FC = () => {
    const { fetchAppointmentCategories, appointmentCategories } =
        useAppointmentCategory();

    const {
        fetchAppointmentsByCategory,
        appointments,
        fetchEarliestAndLatestAppointments,
        error,
        minDate,
        maxDate,
    } = useAppointment(); // Use the appointments hook

    const [selectedAppointmentType, setSelectedAppointmentType] =
        useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<string>(maxDate || "");

    // Fetch appointment categories on component mount
    useEffect(() => {
        fetchAppointmentCategories();
    }, [fetchAppointmentCategories]);

    // Get earliest and latest appointment dates
    useEffect(() => {
        fetchEarliestAndLatestAppointments();
    }, [fetchEarliestAndLatestAppointments]);

    //  Get appointments
    useEffect(() => {
        if (selectedDate && selectedAppointmentType) {
            fetchAppointmentsByCategory(selectedAppointmentType, selectedDate);
        }
    }, [selectedDate, selectedAppointmentType, fetchAppointmentsByCategory]);

    // Update the selectedDate when maxDate changes (if needed)
    useEffect(() => {
        if (maxDate) {
            setSelectedDate(maxDate);
        }
    }, [maxDate]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAppointmentType(event.target.value);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    // Determine grid columns based on number of appointments
    const getGridClass = (count: number) => {
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-1 md:grid-cols-2";
        if (count === 3) return "grid-cols-1 md:grid-cols-2";
        return "grid-cols-1 md:grid-cols-2";
    };

    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 10;

    // Calculate the indices for slicing the appointments array
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment =
        indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = appointments.slice(
        indexOfFirstAppointment,
        indexOfLastAppointment
    );

    // Handle page change
    const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="mb-4">
                    <h1 className="mb-2 text-2xl font-bold">
                        Patient Appointments
                    </h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>

                <section className="flex flex-col items-start">
                    <div className="flex flex-row items-center justify-end w-full gap-10 mt-6 mb-5 sm:mb-0 filter">
                        {/* Filter by month and year */}
                        <div className="relative flex flex-row items-center justify-left w-fit md:w-[17%] gap-2">
                            <label
                                htmlFor="date"
                                className="absolute left-0 top-[-1.5rem] font-medium w-full text-nowrap"
                            >
                                Appointment Date
                            </label>
                            <input
                                className="p-1 py-1.5 text-center bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                                type="date"
                                name="date"
                                id="date"
                                min={minDate}
                                max={maxDate}
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                        </div>

                        <div className="relative flex flex-row items-center gap-5 justify-left min-w-40 md:w-fit">
                            <label
                                htmlFor="appointment-type"
                                className="absolute left-0 top-[-1.5rem] font-medium w-full text-nowrap"
                            >
                                Appointment Type
                            </label>
                            <select
                                className="w-full px-2 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-lg md:w-54 border-1"
                                name="appointment-type"
                                id="appointment-type"
                                required
                                value={selectedAppointmentType}
                                onChange={handleChange}
                            >
                                <option value="All">All</option>
                                {appointmentCategories.map(({ category }) => (
                                    <option
                                        key={category.appointment_category_id}
                                        value={
                                            category.appointment_category_name
                                        }
                                    >
                                        {category.appointment_category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="w-full text-xs rounded-lg sm:text-sm md:text-base sm:py-4 table-container ">
                        <div
                            className={`grid gap-6 ${
                                appointments?.length
                                    ? getGridClass(appointments.length)
                                    : "grid-cols-1"
                            }`}
                        >
                            {error ? (
                                <div className="text-center text-red-500 col-span-full">
                                    Error loading appointments: {error}
                                </div>
                            ) : appointments.length === 0 ? (
                                <div className="w-full p-12 bg-white rounded-lg shadow-md col-span-full">
                                    <h1 className="text-center">
                                        No appointments found for the selected
                                        category.
                                    </h1>
                                </div>
                            ) : (
                                currentAppointments.map((appointment) => (
                                    <div
                                        key={appointment.patient.patient_id}
                                        className="grid grid-cols-1 p-6 bg-white rounded-lg shadow-lg outline outline-1 outline-gray-300"
                                    >
                                        <h3 className="text-lg font-bold uppercase">
                                            {appointment.patient.first_name}{" "}
                                            {appointment.patient.last_name}
                                        </h3>
                                        <div className="w-full h-[2px] border-green border-t-[3px] rounded-md mb-4" />

                                        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-3">
                                            <span className="font-semibold">
                                                Queue Number:
                                            </span>
                                            <span>
                                                {appointment.queue_number}
                                            </span>

                                            <span className="font-semibold">
                                                Sex:
                                            </span>
                                            <span>
                                                {appointment.patient.sex}
                                            </span>

                                            <span className="font-semibold">
                                                Birthdate:
                                            </span>
                                            <span>
                                                {appointment.patient.birthdate}
                                            </span>

                                            <span className="font-semibold">
                                                Address:
                                            </span>
                                            <span className="break-words">
                                                {appointment.patient.address}
                                            </span>

                                            <span className="font-semibold">
                                                Email:
                                            </span>
                                            <span className="break-words">
                                                {appointment.patient.email}
                                            </span>

                                            <span className="font-semibold">
                                                Phone#:
                                            </span>
                                            <span>
                                                {
                                                    appointment.patient
                                                        .phone_number
                                                }
                                            </span>

                                            <span className="font-semibold">
                                                Patient Note:
                                            </span>
                                            <span className="break-words">
                                                {appointment.patient_note ||
                                                    "None"}
                                            </span>

                                            {selectedAppointmentType.toLowerCase() ===
                                                "all" && (
                                                <>
                                                    <span className="font-semibold">
                                                        Appointment Type:
                                                    </span>
                                                    <span className="break-words">
                                                        {appointment
                                                            .appointment_category
                                                            .name || "None"}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-16 sm:justify-center">
                            <button
                                onClick={prevPage}
                                disabled={currentPage <= 1}
                                className="shadow-gray-400 shadow-md w-24 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green transition-all text-[.7rem] sm:text-sm text-white  bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-center align-middle">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={currentPage >= totalPages}
                                className="w-24 disabled:opacity-50 shadow-gray-400 shadow-md disabled:cursor-not-allowed disabled:hover:bg-green transition-all text-[.7rem] sm:text-sm text-white  bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AppointmentList;
