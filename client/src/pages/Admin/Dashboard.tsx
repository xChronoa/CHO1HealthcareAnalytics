import { useRef, useState, useEffect } from "react";
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
    /**
     * 
     * STATE INITIALIZATION AND CUSTOM HOOKS
     * 
     */
    // State for selected barangay and year
    const [section, setSection] = useState<string>("m1");
    const [selectedBarangay, setSelectedBarangay] = useState<string>(''); 
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [maxDate, setMaxDate] = useState<Date | undefined>(undefined);
    const [minDate, setMinDate] = useState<Date | undefined>(undefined);

    // Refs for chart and text elements
    const chartRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);

    // Fetching counts from hooks
    const { fetchCount: fetchPatientCount, patientCount } = usePatient();
    const { fetchCount: fetchAppointmentCount, appointmentCount } = useAppointment();
    const { fetchPendingReportCount, pendingReportCount } = useReportSubmissions();

    // Barangays and dates
    const { barangays, fetchBarangays } = useBarangay();
    const { earliestDate, latestDate, fetchEarliestAndLatestDates } = useReportSubmissions();

    // Loading management
    const { isLoading, incrementLoading } = useLoading();

    /**
     * 
     * USE EFFECT
     * 
     */
    // Fetch patient count, appointment count, and pending report count
    useEffect(() => {
        fetchPatientCount();
        fetchAppointmentCount();
        fetchPendingReportCount();
    }, [fetchPatientCount, fetchAppointmentCount, fetchPendingReportCount]);

    // Fetch barangays on mount
    useEffect(() => {
        fetchBarangays();
    }, []);

    // Set the selected barangay to the first one fetched
    useEffect(() => {
        if (barangays.length > 0) {
            setSelectedBarangay(barangays[0].barangay_name);
        }
    }, [barangays]);

    // Fetch earliest and latest dates for reports
    useEffect(() => {
        fetchEarliestAndLatestDates();
    }, [fetchEarliestAndLatestDates]);

    // Set the max date and selected year based on latest date
    useEffect(() => {
        if (latestDate) {
            const [year, month] = latestDate.split('-');
            const maxDateObj = new Date(Number(year), Number(month) - 1); // Month is zero-based
            setMaxDate(maxDateObj);
            setSelectedYear(year); // Initialize selectedYear to year as string
        }
    }, [latestDate]);

    // Set the min date based on earliest date
    useEffect(() => {
        if (earliestDate) {
            const [year, month] = earliestDate.split('-');
            const minDateObj = new Date(Number(year), Number(month) - 1); // Month is zero-based
            setMinDate(minDateObj);
        }
    }, [earliestDate]);

    useEffect(() => {
        incrementLoading();
    }, [section]);

    /**
     * 
     * EVENT HANDLERS
     * 
     */
    // Handle section toggle
    const handleToggle = (selectedSection: string) => {
        setSection(selectedSection);
    };

    // Handle year change in the date picker
    const handleYearChange = (date: Date | null) => {
        if (date) {
            const yearString = date.getFullYear().toString(); // Extract year as string
            setSelectedYear(yearString); // Set the selected year as a string
        } else {
            setSelectedYear(null); // Reset if date is null
        }
    };

    // Handle barangay selection change
    const handleBarangayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBarangay(event.target.value); // Update state with selected barangay name
    };

    /**
     * 
     * DOWNLOAD CHART
     * 
     */
    // Download the chart as a PDF
    const downloadChart = async () => {
        const input = chartRef.current;

        if (input) {
            // Retrieve and parse the morbidityChart data from localStorage
            const morbidityChartData = JSON.parse(localStorage.getItem('morbidityChart') || 'null');

            // Early return if no data is available
            if (!morbidityChartData) return;

            // Destructure and extract chart data more efficiently
            const { 
                male: { data: maleData, options: maleOptions } = {},
                female: { data: femaleData, options: femaleOptions } = {} 
            } = morbidityChartData || {};

            // If you need stringified versions, do this only if necessary
            const chartData = {
                male: {
                    data: JSON.stringify(maleData),
                    options: JSON.stringify(maleOptions)
                },
                female: {
                    data: JSON.stringify(femaleData),
                    options: JSON.stringify(femaleOptions)
                }
            };

            // Open a new document
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>${morbidityChartData.title}</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                            <style>
                                body{visibility:hidden;background-color:gray}@media print{#chart-title,.chart{width:100%!important}*{-webkit-print-color-adjust:exact;color-adjust:exact;print-color-adjust:exact}@page{margin:0;size:400mm 472.1mm;orientation:landscape}body{visibility:visible}.bg-almond{background-color:#f8e9d3}.bg-green{background-color:green}.resize-icon{display:none!important}#myChart{page-break-inside:avoid;break-inside:avoid}.chart-container canvas{width:100%!important;height:90%!important}.chart{height:788px!important}.legend-container{height:100%!important}}
                            </style>
                        </head>
                        <body>
                            ${input.outerHTML}
                            <script>
                                const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];

                                const maleCtx = document.getElementById('male-chart').getContext('2d');
                                const femaleCtx = document.getElementById('female-chart').getContext('2d');
            
                                // Initialize the male chart
                                new Chart(maleCtx, {
                                    type: 'line',
                                    data: ${chartData.male.data},
                                    options: {
                                        ...${chartData.male.options},
                                        responsive: false,
                                        scales: {
                                            x: {
                                                ...${chartData.male.options}.scales.x,
                                                ticks: {
                                                    callback: function(value) {
                                                        return monthNames[Number(value) % 12];
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    maintainAspectRatio: true,
                                });

                                // Initialize the female chart
                                new Chart(femaleCtx, {
                                    type: 'line',
                                    data: ${chartData.female.data},
                                    options: {
                                        ...${chartData.female.options},
                                        responsive: false,
                                        scales: {
                                            x: {
                                                ...${chartData.female.options}.scales.x,
                                                ticks: {
                                                    callback: function(value) {
                                                        return monthNames[Number(value) % 12];
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    maintainAspectRatio: true,
                                });
                            </script>
                        </body>
                    </html>
                `);
    
                printWindow.document.close();
                printWindow.focus();

                printWindow.onload = () => setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
        
        // if (!input) {
        //     Swal.fire({
        //         icon: "error",
        //         title: "Oops!",
        //         text: "We can't find the chart to download. Please refresh the page and try again.",
        //         toast: true,
        //         position: "top-end",
        //         showConfirmButton: false,
        //         timer: 4000,
        //         timerProgressBar: true,
        //         background: "#f8d7da",
        //         color: "#721c24",
        //         customClass: {
        //             popup: "border border-danger",
        //         },
        //     });
        //     return;
        // }
    
        // // Ask for confirmation before downloading
        // const confirmation = await Swal.fire({
        //     title: "Download Chart?",
        //     text: "Would you like to download the chart as a PDF?",
        //     icon: "question",
        //     showCancelButton: true,
        //     confirmButtonText: "Yes, download it!",
        //     cancelButtonText: "No, cancel",
        //     customClass: {
        //         popup: "border border-primary",
        //     },
        // });
    
        // if (!confirmation.isConfirmed) {
        //     // If user canceled, do nothing
        //     return;
        // }
    
        // try {
        //     setIsPrinting(true);
        //     const canvas = await html2canvas(input as HTMLElement);
        //     const imgData = canvas.toDataURL("image/png");
    
        //     // Create a PDF with the exact dimensions of the chart
        //     const pdf = new jsPDF({
        //         orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        //         unit: "px",
        //         format: [canvas.width, canvas.height],
        //     });
    
        //     // Add the image to the PDF, fitting it exactly to the page
        //     pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        //     pdf.save(`${section.toUpperCase()} - ${textRef.current ? textRef.current.textContent : ""} - Chart.pdf`);
    
        //     // Show success toast notification
        //     Swal.fire({
        //         icon: "success",
        //         title: "Download Successful!",
        //         text: "Your chart has been downloaded successfully.",
        //         toast: true,
        //         position: "top-end",
        //         showConfirmButton: false,
        //         timer: 3000,
        //         timerProgressBar: true,
        //         background: "#fff",
        //         color: "#155724",
        //         customClass: {
        //             popup: "border border-success",
        //         },
        //     });
        // } catch (error) {
        //     Swal.fire({
        //         icon: "error",
        //         title: "Download Failed",
        //         text: "Something went wrong while generating the PDF. Please try again.",
        //         toast: true,
        //         position: "top-end",
        //         showConfirmButton: false,
        //         timer: 4000,
        //         timerProgressBar: true,
        //         background: "#f8d7da",
        //         color: "#721c24",
        //         customClass: {
        //             popup: "border border-danger",
        //         },
        //     });
        // } finally {
        //     setIsPrinting(false);
        // }
    };



    /**
     * 
     * SECTION TOGGLE - CLASS STYLE
     * 
     */
    // Get button class based on the section selected
    const getButtonClass = (currentSection: string) =>
        `shadow-md shadow-[#a3a19d] px-4 py-2 ${
            currentSection === section
                ? "bg-green text-white"
                : "bg-slate-200 text-black"
        }`;

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
                <div className="flex flex-col mt-5 visualize-data">
                    {/* Menus */}
                    <section className="relative flex flex-col items-center justify-between text-xs transition-all xl:flex-row buttons xl:text-sm">
                        {/* Barangay & Year */}
                        <div className="z-30 flex flex-row items-center justify-center flex-1 w-full gap-4 xl:w-auto xl:flex-none options-one">
                            {/* Barangay */}
                            <div className="flex flex-col flex-1 mb-3 input-group">
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

                            {/* Year */}
                            <div className="flex flex-col flex-1 mb-3 input-group">
                                <label htmlFor="year">Year</label>
                                <DatePicker
                                    name="year"
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    selected={selectedYear ? new Date(`${selectedYear}-01-01`) : null}
                                    onChange={handleYearChange}
                                    showYearPicker                   // Enables year-only view
                                    dateFormat="yyyy"                // Sets display format to year only
                                    className="w-full py-2 border border-gray-300 rounded-lg shadow-lg"
                                    placeholderText={`${isLoading ? "Loading..." : "Select Year"}`}    // Optional placeholder
                                    showYearDropdown                  // Enables year dropdown
                                    scrollableYearDropdown            // Makes dropdown scrollable
                                    yearDropdownItemNumber={10}       // Shows 10 years at a time in dropdown
                                    onFocus={e => e.target.blur()}
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-row justify-between flex-1 w-full gap-4 xl:w-auto xl:flex-none options-two">
                            {/* Section */}
                            <div className="z-10 flex items-center justify-center flex-1 xl:flex-none xl:absolute xl:inset-0 toggle-sections">
                                <button
                                    onClick={() => handleToggle("m1")}
                                    className={`${getButtonClass(
                                        "m1"
                                    )} rounded-l-lg text-nowrap xl:py-2 w-full xl:w-fit`}
                                >
                                    M1 Data
                                </button>
                                <button
                                    onClick={() => handleToggle("m2")}
                                    className={`${getButtonClass(
                                        "m2"
                                    )} rounded-r-lg text-nowrap xl:py-2 w-full xl:w-fit`}
                                >
                                    M2 Data
                                </button>
                            </div>

                            {/* Download */}
                            <div className="z-20 flex items-center justify-center flex-1 xl:flex-0 download">
                                <button
                                    onClick={downloadChart}
                                    className="transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-white inline-flex justify-center items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-4 py-2.5 text-center text-nowrap flex-1"
                                >
                                    Download Charts 
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="dividing-line my-5 w-full h-[2px] bg-black"></div>
                    
                    {/* Chart */}
                    {selectedYear && selectedBarangay && (
                        <>
                            {section === "m1" && (
                                <ServiceDataChart
                                    chartRef={chartRef}
                                    textRef={textRef}
                                    barangay={selectedBarangay}
                                    year={selectedYear}
                                />
                            )}
                            {section === "m2" && (
                                <MorbidityFormChart
                                    chartRef={chartRef}
                                    textRef={textRef}
                                    barangay={selectedBarangay}
                                    year={selectedYear}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
