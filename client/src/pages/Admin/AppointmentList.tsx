import { useState } from "react";
import { useAppointmentCategory } from "../../hooks/useAppointmentCategory";
import { useAppointment } from "../../hooks/useAppointment"; // Hook for fetching appointments
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import Loading from "../../components/Loading";

const AppointmentList: React.FC = () => {
    const {
        fetchAppointmentCategories,
        appointmentCategories,
    } = useAppointmentCategory();
    const {
        fetchAppointmentsByCategory,
        fetchPatientsAppointments,
        appointments,
        error,
        minDate,
        maxDate,
    } = useAppointment(); // Use the appointments hook

    const [selectedAppointmentType, setSelectedAppointmentType] =
        useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<string>(maxDate || "");

    // Fetch appointment categories on component mount
    useEffectAfterMount(() => {
        fetchAppointmentCategories();
    }, [fetchAppointmentCategories]);

    // Fetch the initial data (date and/or other side effects) when the component mounts
    useEffectAfterMount(() => {
        if(!maxDate) {
            fetchPatientsAppointments(); // Assume this handles side effects like setting state
        }

        // Trigger fetching appointments by category if conditions are met
        if (selectedDate && selectedAppointmentType) {
            fetchAppointmentsByCategory(selectedAppointmentType, selectedDate);
        }
    }, [
        selectedDate,
        selectedAppointmentType,
        fetchAppointmentsByCategory,
        fetchPatientsAppointments,
    ]);

    // Update the selectedDate when maxDate changes (if needed)
    useEffectAfterMount(() => {
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
                        <div className="relative flex flex-row items-center justify-center w-fit md:w-[17%] gap-2">
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

                        <div className="relative flex flex-row items-center justify-center gap-5 min-w-40 md:w-fit">
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
                                {appointmentCategories.map((category) => (
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

                    <div className="w-full p-4 overflow-x-auto rounded-lg shadow-md sm:py-4 table-container outline outline-1 shadow-black sm:outline-0 sm:shadow-transparent">
                        <table className="hidden w-full text-center md:table md:w-full">
                            {/* Table Header */}
                            <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">
                                        Name
                                    </th>
                                    <th className="px-4 py-2">Sex</th>
                                    <th className="px-4 py-2">Birthdate</th>
                                    <th className="px-4 py-2">Address</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">
                                        Phone#
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {error ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-2 text-center text-red-500"
                                        >
                                            Error loading appointments: {error}
                                        </td>
                                    </tr>
                                ) : appointments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-2 text-center"
                                        >
                                            No appointments found for the
                                            selected category.
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map((appointment) => (
                                        <tr
                                            key={appointment.patient.patient_id}
                                        >
                                            <td className="px-4 py-2 font-semibold">
                                                {appointment.patient.first_name}{" "}
                                                {appointment.patient.last_name}
                                            </td>
                                            <td className="px-4 py-2 font-semibold">
                                                {appointment.patient.sex}
                                            </td>
                                            <td className="px-4 py-2 font-semibold">
                                                {appointment.patient.birthdate}
                                            </td>
                                            <td className="px-4 py-2 font-semibold">
                                                {appointment.patient.address}
                                            </td>
                                            <td className="px-4 py-2 font-semibold">
                                                {appointment.patient.email}
                                            </td>
                                            <td className="px-4 py-2 font-semibold">
                                                {
                                                    appointment.patient
                                                        .phone_number
                                                }
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div className="md:hidden">
                            {error ? (
                                <p className="text-center text-red-500">
                                    Error loading appointments: {error}
                                </p>
                            ) : appointments.length === 0 ? (
                                <p className="text-center text-gray-600">
                                    No appointments found for the selected
                                    category.
                                </p>
                            ) : (
                                appointments.map((appointment) => (
                                    <div
                                        key={appointment.patient.patient_id}
                                        className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-md"
                                    >
                                        <h2 className="mb-2 text-lg font-semibold text-gray-800">
                                            {appointment.patient.first_name}{" "}
                                            {appointment.patient.last_name}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            <strong>Sex:</strong>{" "}
                                            {appointment.patient.sex}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Birthdate:</strong>{" "}
                                            {appointment.patient.birthdate}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Address:</strong>{" "}
                                            {appointment.patient.address}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Email:</strong>{" "}
                                            {appointment.patient.email}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Phone#:</strong>{" "}
                                            {appointment.patient.phone_number}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AppointmentList;
