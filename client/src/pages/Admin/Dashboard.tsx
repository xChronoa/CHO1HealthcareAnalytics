import { useEffect, useState } from "react";
import FamilyPlanningChart from "./Chart/FamilyPlanningChart";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { usePatient } from "../../hooks/usePatient";
import { useAppointment } from "../../hooks/useAppointment";
import Loading from "../../components/Loading";

interface DashboardProp {
    barangayLogo?: string;
}

const Dashboard: React.FC<DashboardProp> = () => {
    const [section, setSection] = useState<string>("m1");
    const { fetchPatients, patients } = usePatient();
    const { fetchPatientsAppointments, appointments, appointmentLoading } = useAppointment();

    const handleToggle = (selectedSection: string) => {
        setSection(selectedSection);
    };

    const getButtonClass = (currentSection: string) =>
        `shadow-md shadow-[#a3a19d] px-4 py-2 ${
            currentSection === section
                ? "bg-green text-white"
                : "bg-slate-200 text-black"
        }`;

    useEffectAfterMount(() => {
        fetchPatients();
        fetchPatientsAppointments();
    }, [fetchPatients]);

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="mb-4">
                    <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>

                {/* Overview of Total Patients, Appointments, and Pending Reports */}
                <div className="flex items-center justify-center gap-5 overview">
                    <div className="flex flex-col items-center flex-1 px-4 py-2 bg-yellow-500 shadow-lg rounded-2xl shadow-neutral-300 total-patients">
                        <label htmlFor="patient-amount">Total Patients</label>
                        <span className="text-2xl font-bold text-center text-black bg-transparent patient-amount">
                            {patients?.length}
                        </span>
                    </div>
                    <div className="flex flex-col items-center flex-1 px-4 py-2 bg-yellow-500 shadow-lg rounded-2xl shadow-neutral-300 total-appointments">
                        <label htmlFor="appointment-amount">
                            Total Appointments
                        </label>
                        <span className="text-2xl font-bold text-center text-black bg-transparent appointment-amount">
                            {appointments?.length}
                        </span>
                    </div>
                    <div className="flex flex-col items-center flex-1 px-4 py-2 bg-yellow-500 shadow-lg rounded-2xl shadow-neutral-300 total-pending-barangay-report">
                        <label htmlFor="pending-report-amount">
                            Pending Barangay Report
                        </label>
                        <span className="text-2xl font-bold text-center text-black bg-transparent pending-report-amount">
                            3
                        </span>
                    </div>
                </div>

                <div className="dividing-line mt-5 w-full h-[2px] bg-black"></div>

                {/* Data Visualization of M1 and M2 report */}
                <div className="mt-5 visualize-data">
                    <div className="flex items-center justify-center transition-all toggle-sections">
                        <button
                            onClick={() => handleToggle("m1")}
                            className={`${getButtonClass(
                                "m1"
                            )} rounded-tl-lg rounded-bl-lg`}
                        >
                            M1 Data
                        </button>
                        <button
                            onClick={() => handleToggle("m2")}
                            className={`${getButtonClass(
                                "m2"
                            )} rounded-tr-lg rounded-br-lg`}
                        >
                            M2 Data
                        </button>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-xl font-bold">
                            {`Displaying ${section.toUpperCase()} Data`}
                        </h2>
                        {section === "m1" && <FamilyPlanningChart />}
                        {section === "m2" && "M2"}
                    </div>
                </div>
            </div>
            {appointmentLoading && <Loading />}
        </>
    );
};

export default Dashboard;
