import { useRef, useState } from "react";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { usePatient } from "../../hooks/usePatient";
import { useAppointment } from "../../hooks/useAppointment";
import { useReportSubmissions } from "../../hooks/useReportSubmissions";
import ServiceDataChart from "./Chart/ServiceDataChart";
import MorbidityFormChart from "./Chart/MorbidityFormChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";

interface DashboardProp {
    barangayLogo?: string;
}

const Dashboard: React.FC<DashboardProp> = () => {
    const [section, setSection] = useState<string>("m1");
    const { fetchCount: fetchPatientCount, patientCount } = usePatient();
    const { fetchCount: fetchAppointmentCount, appointmentCount } =
        useAppointment();
    const { fetchPendingReportCount, pendingReportCount } =
        useReportSubmissions();

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
        fetchPatientCount(), fetchAppointmentCount(), fetchPendingReportCount();
    }, [fetchPatientCount, fetchAppointmentCount, fetchPendingReportCount]);

    const chartRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);

    const downloadChart = async () => {
        const input = chartRef.current;

        if (!input) {
            // Display toast notification for error
            Swal.fire({
                icon: "error",
                title: "Oops!",
                text: "We can’t find the chart to download. Please refresh the page and try again.",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true,
                background: "#f8d7da",
                color: "#721c24",
                customClass: {
                    popup: "border border-danger",
                },
            });
            return;
        }

        try {
            const canvas = await html2canvas(input as HTMLElement);
            const imgData = canvas.toDataURL("image/png");

            // Create a PDF with the exact dimensions of the chart
            const pdf = new jsPDF({
                orientation:
                    canvas.width > canvas.height ? "landscape" : "portrait",
                unit: "px",
                format: [canvas.width, canvas.height],
            });

            // Add the image to the PDF, fitting it exactly to the page
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`${section.toUpperCase()} - ${textRef.current ? textRef.current.textContent : ""} - Chart.pdf`);

            // Show success toast notification
            Swal.fire({
                icon: "success",
                title: "Download Successful!",
                text: "Your chart has been downloaded successfully.",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: "#fff",
                color: "#155724",
                customClass: {
                    popup: "border border-success",
                },
            });
        } catch (error) {
            // Display toast notification indicating download failure
            Swal.fire({
                icon: "error",
                title: "Download Failed",
                text: "Something went wrong while generating the PDF. Please try again.",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true,
                background: "#f8d7da",
                color: "#721c24",
                customClass: {
                    popup: "border border-danger",
                },
            });
            console.error("Error generating PDF: ", error);
        }
    };

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="mb-4">
                    <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>

                {/* Overview of Total Patients, Appointments, and Pending Reports */}
                <div className="flex justify-center gap-5 overview">
                    <div className="flex flex-col items-center justify-center flex-1 px-4 py-2 text-center bg-yellow-500 shadow-lg rounded-2xl shadow-neutral-300 total-patients">
                        <label htmlFor="patient-amount">Total Patients</label>
                        <span className="text-2xl font-bold text-center text-black bg-transparent patient-amount">
                            {patientCount}
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 px-4 py-2 text-center bg-yellow-500 shadow-lg rounded-2xl shadow-neutral-300 total-appointments">
                        <label htmlFor="appointment-amount">
                            Total Appointments
                        </label>
                        <span className="text-2xl font-bold text-center text-black bg-transparent appointment-amount">
                            {appointmentCount}
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 px-4 py-2 text-center bg-yellow-500 shadow-lg rounded-2xl shadow-neutral-300 total-pending-barangay-report">
                        <label htmlFor="pending-report-amount">
                            Pending Barangay Report
                        </label>
                        <span className="text-2xl font-bold text-center text-black bg-transparent pending-report-amount">
                            {pendingReportCount}
                        </span>
                    </div>
                </div>

                <div className="dividing-line mt-5 w-full h-[2px] bg-black"></div>

                {/* Data Visualization of M1 and M2 report */}
                <div className="mt-5 visualize-data">
                    <section className="flex flex-row items-center justify-between buttons">
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
                        <div className="download">
                            <button
                                onClick={downloadChart}
                                className="transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                            >
                                Download Charts
                            </button>
                        </div>
                    </section>
                    <div className="mt-4">
                        {section === "m1" && (
                            <ServiceDataChart chartRef={chartRef} textRef={textRef}/>
                        )}
                        {section === "m2" && (
                            <MorbidityFormChart chartRef={chartRef} textRef={textRef}/>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
