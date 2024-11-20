import { useEffect, useState } from "react";
import { useAppointmentCategory } from "../../hooks/useAppointmentCategory";
import { Appointment, useAppointment } from "../../hooks/useAppointment"; // Hook for fetching appointments

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
        updateAppointment,
        setAppointments
    } = useAppointment(); // Use the appointments hook

    const [selectedStatus, setSelectedStatus] = useState<string>("pending");
    const [selectedAppointmentType, setSelectedAppointmentType] =
        useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<string>(maxDate || "");

    // 1. Fetch appointment categories on component mount
    useEffect(() => {
        fetchAppointmentCategories();
    }, [fetchAppointmentCategories]);

    // 2. Get earliest and latest appointment dates after categories are fetched
    useEffect(() => {
        fetchEarliestAndLatestAppointments();
    }, [fetchEarliestAndLatestAppointments]);

    // 3. Fetch appointments after a date and appointment type are selected
    useEffect(() => {
        if (selectedStatus && selectedDate && selectedAppointmentType) {
            fetchAppointmentsByCategory(selectedStatus, selectedAppointmentType, selectedDate);
        }
    }, [selectedStatus, selectedDate, selectedAppointmentType, fetchAppointmentsByCategory]);

    // 4. Update the selectedDate when maxDate changes
    useEffect(() => {
        if (maxDate) {
            setSelectedDate(maxDate);
        }
    }, [maxDate]);

    const handleAppointmentTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAppointmentType(event.target.value);
    };

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(event.target.value);
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
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const [currentAppointments, setCurrentAppointments] = useState<Appointment[]>([]);

    // Handle page change
    const totalPages = Math.ceil(appointments.length / appointmentsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const statusOptions = ["pending", "complete", "no-show"];
    
    // Handle status change (update state and trigger backend request)
    const handlePatientStatusChange = async (appointmentId: number, newStatus: string) => {
        // Check if prevAppointments is not null and is an array
        setAppointments((prevAppointments) =>
            prevAppointments ? prevAppointments.map((appt) =>
                appt.id === appointmentId ? { ...appt, status: newStatus } : appt
            ) : []
        );


        // Ensure appointmentId is a valid number before proceeding
        if (appointmentId && typeof appointmentId === 'number') {
            const appointment = appointments.find((appt) => appt.id === appointmentId);
            if (appointment) {
                // Let updateAppointment handle any errors
                await updateAppointment(appointment.id, { status: newStatus });

                if (selectedStatus && selectedDate && selectedAppointmentType) {
                    fetchAppointmentsByCategory(selectedStatus, selectedAppointmentType, selectedDate);
                }
            }
        } else {
            console.error("Invalid appointment ID.");
        }
    };

    useEffect(() => {
        setCurrentAppointments(appointments.slice(
            indexOfFirstAppointment,
            indexOfLastAppointment
        ));
    }, [appointments])

    const formatDateForDisplay = (dateStr: string) => {
        if(!dateStr) return "";
        
        const [year, month, day] = dateStr.split("-");

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString("en-PH", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <>
            <div className="container w-11/12 pt-6 pb-12">
                <header className="mb-4">
                    <div className="flex flex-col items-center justify-center gap-4 mb-2 md:gap-2 lg:gap-0 md:flex-row group">
                        <h1 className="self-center mb-2 text-2xl font-bold sm:mb-0 sm:text-xl md:self-end text-nowrap w-fit">
                            Patient Appointments
                        </h1>
                        <div className="flex flex-col items-center justify-between w-full gap-10 mt-6 mb-5 text-xs md:text-sm lg:justify-end sm:flex-row sm:mb-0 filter">
                            {/* Filter by month and year */}
                            <div className="relative flex flex-row items-center justify-left w-full sm:w-fit min-w-28 md:w-[17%] gap-2">
                                <label
                                    htmlFor="date"
                                    className="absolute left-0 top-[-1.5rem] font-medium w-full text-nowrap"
                                >
                                    Appointment Status
                                </label>
                                <select
                                    className="w-full px-2 py-2 capitalize bg-gray-100 border border-gray-300 rounded-lg shadow-lg md:w-54 border-1"
                                    value={selectedStatus}
                                    name="appointment-status"
                                    id="appointment-status"
                                    required
                                    onChange={handleStatusChange}
                                >
                                    <option value="All">All</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Filter by month and year */}
                            <div className="relative flex flex-row items-center justify-left w-full sm:w-fit min-w-36 md:w-[17%] gap-2">
                                <label
                                    htmlFor="date"
                                    className="absolute left-0 top-[-1.5rem] font-medium w-full text-nowrap"
                                >
                                    Appointment Date
                                </label>
                                <input
                                    className="w-full pl-2 p-1 py-1.5 text-left bg-gray-100 border border-gray-300 rounded-lg shadow-lg border-1"
                                    type="date"
                                    name="date"
                                    id="date"
                                    min={minDate}
                                    max={maxDate}
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                />
                            </div>

                            <div className="relative flex flex-row items-center w-full gap-5 justify-left min-w-40 sm:w-fit">
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
                                    onChange={handleAppointmentTypeChange}
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
                    </div>
                    
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>

                <section className="flex flex-col items-start">
                    

                    <div className="w-full text-xs rounded-lg lg:text-sm sm:py-4 table-container ">
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
                                        className="flex flex-col items-start p-6 bg-white rounded-lg shadow-lg outline outline-1 outline-gray-300"
                                    >
                                        <h3 className="text-lg font-bold uppercase">
                                            {appointment.patient.first_name}{" "}
                                            {appointment.patient.last_name}
                                        </h3>
                                        <div className={`w-full h-[5px] ${
                                                {
                                                    "no-show": "bg-red-500",
                                                    "pending": "bg-yellow-500",
                                                    "complete": "bg-green",
                                                }[appointment.status.toLowerCase()]} rounded-md mb-4`} 
                                        />

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
                                                {formatDateForDisplay(appointment.patient.birthdate)}
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
                                                {appointment.patient.phone_number}
                                            </span>

                                            <span className="font-semibold">
                                                Patient Note:
                                            </span>
                                            <span className="text-justify break-words">
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
                                            
                                            <span className="font-semibold">
                                                Appointment Status:
                                            </span>
                                            <select
                                                value={appointment.status}
                                                onChange={async (event) => {
                                                    const newStatus = event.target.value;

                                                    handlePatientStatusChange(appointment.id, newStatus);
                                                }}
                                                className={`px-2 font-bold uppercase bg-gray-100 border border-black rounded w-fit focus:outline-none focus:ring ${
                                                    {
                                                        "no-show": "bg-red-500 text-white",
                                                        "pending": "bg-yellow-500",
                                                        "complete": "bg-green text-white",
                                                    }[appointment.status.toLowerCase()]
                                                }`}
                                            >
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-16 sm:justify-center">
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

export default AppointmentList;
