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
import { useBarangay } from "../../hooks/useBarangay";
import { useLoading } from "../../context/LoadingContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

    const { barangays, fetchBarangays } = useBarangay();
    const { isLoading } = useLoading();

    useEffectAfterMount(() => {
        fetchBarangays();
    }, []);

    useEffectAfterMount(() => {
        if (barangays.length > 0) {
            setSelectedBarangay(barangays[0].barangay_name);
        }
    }, [barangays]);

    const {
        earliestDate,
        latestDate,
        fetchEarliestAndLatestDates,
    } = useReportSubmissions();

    const [selectedBarangay, setSelectedBarangay] = useState<string>(''); // State for selected barangay
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [maxDate, setMaxDate] = useState<Date | undefined>(undefined);
    const [minDate, setMinDate] = useState<Date | undefined>(undefined);

    useEffectAfterMount(() => {
        // Fetch the earliest and latest dates when the component mounts
        fetchEarliestAndLatestDates();
    }, [fetchEarliestAndLatestDates]);

    useEffectAfterMount(() => {
        if (latestDate) {
            const [year, month] = latestDate.split('-');
            const maxDateObj = new Date(Number(year), Number(month) - 1); // Month is zero-based

            setMaxDate(maxDateObj);
            setSelectedYear(year); // Initialize selectedYear to year as string
        }
    }, [latestDate]);

    useEffectAfterMount(() => {
        if (earliestDate) {
            const [year, month] = earliestDate.split('-');
            const minDateObj = new Date(Number(year), Number(month) - 1); // Month is zero-based
            setMinDate(minDateObj);
        }
    }, [earliestDate]);

    const handleYearChange = (date: Date | null) => {
        if (date) {
            const yearString = date.getFullYear().toString(); // Extract year as string
            setSelectedYear(yearString); // Set the selected year as a string
        } else {
            setSelectedYear(null); // Reset if date is null
        }
    };

    const handleBarangayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBarangay(event.target.value); // Update state with selected barangay name
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
                    <section className="flex flex-row justify-between filter">
                        <div className="flex flex-col mb-3 input-group w-fit">
                            <label htmlFor="barangay_name">Barangay</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-lg border-1"
                                name="barangay_name"
                                id="barangay_name"
                                value={selectedBarangay}
                                onChange={handleBarangayChange}
                                required
                            >
                                {/* Can be replaced with the barangay values from the database */}
                                {isLoading && !selectedBarangay ? (
                                    <option hidden>Loading...</option>
                                ) : (
                                    barangays.map((barangay) => (
                                        <option
                                            key={barangay.barangay_id}
                                            value={barangay.barangay_name}
                                        >
                                            {barangay.barangay_name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="flex flex-col mb-3 input-group w-fit">
                            <label htmlFor="year">Year</label>
                            <DatePicker
                                minDate={minDate}
                                maxDate={maxDate}
                                selected={selectedYear ? new Date(`${selectedYear}-01-01`) : null}
                                onChange={handleYearChange}
                                showYearPicker                   // Enables year-only view
                                dateFormat="yyyy"                // Sets display format to year only
                                className="py-2 border border-gray-300 rounded-lg shadow-lg w-fit"
                                placeholderText={`${isLoading ? "Loading..." : "Select Year"}`}    // Optional placeholder
                                showYearDropdown                  // Enables year dropdown
                                scrollableYearDropdown            // Makes dropdown scrollable
                                yearDropdownItemNumber={10}       // Shows 10 years at a time in dropdown
                                onFocus={e => e.target.blur()}
                            />
                        </div>
                    </section>
                    <div className="mt-4">
                    {selectedYear && selectedBarangay && (
                        <>
                            {section === "m1" && (
                                <ServiceDataChart
                                    chartRef={chartRef}
                                    textRef={textRef}
                                    barangay={selectedBarangay}
                                    year={selectedYear} // Use selectedYear directly
                                />
                            )}
                            {section === "m2" && (
                                <MorbidityFormChart
                                    chartRef={chartRef}
                                    textRef={textRef}
                                    barangay={selectedBarangay}
                                    year={selectedYear} // Use selectedYear directly
                                />
                            )}
                        </>
                    )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
