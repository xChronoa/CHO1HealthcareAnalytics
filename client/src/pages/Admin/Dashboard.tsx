import { useRef, useState, useEffect } from "react";
import { usePatient } from "../../hooks/usePatient";
import { useAppointment } from "../../hooks/useAppointment";
import { useReportSubmissions } from "../../hooks/useReportSubmissions";
import ServiceDataChart from "./Chart/ServiceDataChart";
import MorbidityFormChart from "./Chart/MorbidityFormChart";
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
    const [selectedYear, setSelectedYear] = useState<string | null>(new Date().getFullYear().toString());
    const [maxDate, setMaxDate] = useState<Date | undefined>(undefined);
    const [minDate, setMinDate] = useState<Date | undefined>(undefined);

    // Refs for chart and text elements
    const chartRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);

    // Section ref to check for changes
    const prevSectionRef = useRef<string>(section);

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
        // Check if the section has changed
        if (prevSectionRef.current !== section) {
            incrementLoading(); // Call incrementLoading only if section changed
        }

        // Update the ref with the current section value
        prevSectionRef.current = section;
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
            const chartsData = JSON.parse(localStorage.getItem('charts') || 'null');

            // Retrieve and parse the morbidityChart data from localStorage
            const morbidityChartData = chartsData.morbidityChartData;
            const wraChartData = chartsData.wraChartData;
            const fpChartData = chartsData.fpChartData;
            const serviceDataChart = chartsData.serviceDataChart;

            // Early return if no data is available
            if (morbidityChartData) {
                // Destructure and extract chart data more efficiently
                const { 
                    male: { data: maleData = [], options: maleOptions = {} } = {},
                    female: { data: femaleData = [], options: femaleOptions = {} } = {} 
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
                                    body{visibility:hidden;background-color:gray}@media print{#chart-title,.chart{width:100%!important}*{-webkit-print-color-adjust:exact;color-adjust:exact;print-color-adjust:exact}@page{margin:0;size:400mm 463.7mm;orientation:landscape}body{visibility:visible;background-color:#fff}.bg-almond{background-color:#f8e9d3}.bg-green{background-color:green}.resize-icon{display:none!important}#myChart{page-break-inside:avoid;break-inside:avoid;padding-top:2rem;padding-bottom:2rem;padding-left:2rem!important;padding-right:2rem!important;margin-top:0;margin-bottom:0}.chart-container canvas{width:100%!important;height:90%!important}.chart{height:788px!important;flex-direction:row!important}.legend-container{height:fit-content!important}.legend-list{padding-bottom:0!important}}
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

                                    window.addEventListener('resize', function () {
                                        Chart.helpers.each(Chart.instances, function(instance){
                                            instance.resize();
                                        })
                                    });

                                    window.onload = function() {
                                        setTimeout(() => {
                                            window.print();
                                            window.close();
                                        }, 2000);
                                    };
                                </script>
                            </body>
                        </html>
                    `);
        
                    printWindow.document.close();
                    printWindow.focus();
                }
            };

            if(wraChartData) {
                // Destructure and extract chart data more efficiently
                const { 
                    title, 
                    data, 
                    options 
                } = wraChartData || {}; // Optional chaining to safely access properties

                // If you need a stringified version of the WRA chart data, do this only if necessary
                const chartData = {
                    title: title, // Keep title as is (usually not stringified)
                    data: JSON.stringify(data), // Stringify the data
                    options: JSON.stringify(options) // Stringify the options
                };

                // Open a new document
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8" />
                                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                <title>${wraChartData.title}</title>
                                <script src="https://cdn.tailwindcss.com"></script>
                                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                                <style>
                                    body{visibility:hidden;background-color:gray}@media print{#chart-title,.chart{width:100%!important}*{-webkit-print-color-adjust:exact;color-adjust:exact;print-color-adjust:exact}@page{margin:0;size:400mm 236.84mm;orientation:landscape}body{visibility:visible;background-color:#fff}.bg-almond{background-color:#f8e9d3}.bg-green{background-color:green}.resize-icon{display:none!important}#myChart{page-break-inside:avoid;break-inside:avoid;padding-top:2rem;padding-bottom:2rem;margin-top:0;margin-bottom:0}#myChart{padding-left:2rem!important;padding-right:2rem!important}.chart-container canvas{width:100%!important;height:90%!important}.chart{height:788px!important;flex-direction:row!important}.legend-container{height:fit-content!important}}
                                </style>
                            </head>
                            <body>
                                ${input.outerHTML}
                                <script>
                                    const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];

                                    const wraCtx = document.getElementById('wra-chart').getContext('2d');

                                    // Initialize the male chart
                                    const chart = new Chart(wraCtx, {
                                        type: 'line',
                                        data: ${chartData.data},
                                        options: {
                                            ...${chartData.options},
                                            responsive: false,
                                            scales: {
                                                x: {
                                                    ...${chartData.options}.scales.x,
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

                                    window.addEventListener('resize', function () {
                                        Chart.helpers.each(Chart.instances, function(instance){
                                            instance.resize();
                                        })
                                    });

                                    window.onload = function() {
                                        setTimeout(() => {
                                            window.print();
                                            window.close();
                                        }, 2000);
                                    };
                                </script>
                            </body>
                        </html>
                    `);
        
                    printWindow.document.close();
                    printWindow.focus();
                }
            }
            
            if (fpChartData) {
                // Open a new document
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8" />
                                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                <title>${fpChartData.title}</title>
                                <script src="https://cdn.tailwindcss.com"></script>
                                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                                <style>
                                    body{visibility:hidden;background-color:gray}@media print{#chart-title,.chart{width:100%!important}*{-webkit-print-color-adjust:exact;color-adjust:exact;print-color-adjust:exact}@page{margin:0;size:400mm 671.1mm;orientation:landscape}body{visibility:visible;background-color:#fff}.bg-almond{background-color:#f8e9d3}.bg-green{background-color:green}.resize-icon{display:none!important}#myChart{page-break-inside:avoid;break-inside:avoid;padding-top:2rem;padding-bottom:2rem;margin-top:0;margin-bottom:0}#myChart{padding-left:2rem!important;padding-right:2rem!important}.chart-container canvas{width:100%!important;height:90%!important}.chart{height:788px!important;flex-direction:row!important}.legend-container{height:fit-content!important}}
                                </style>
                            </head>
                            <body>
                                ${input.outerHTML}
                                <script>
                                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                                    const canvasElements = document.querySelectorAll('.chart-container canvas'); // Select canvas elements
                                    const ageCategories = Object.keys(${JSON.stringify(fpChartData)}).filter(key => key !== 'title'); // Dynamically get age categories

                                    ageCategories.forEach((ageCategory, index) => {
                                        const ageCategoryData = ${JSON.stringify(fpChartData)}[ageCategory]; // Get data for current age category

                                        if (ageCategoryData) {
                                            const ctx = canvasElements[index].getContext('2d'); // Get context for the canvas
                                            
                                            // Initialize the chart
                                            const chart = new Chart(ctx, {
                                                type: 'line',
                                                data: ageCategoryData.data,
                                                options: {
                                                    ...ageCategoryData.options,
                                                    responsive: false,
                                                    scales: {
                                                        x: {
                                                            ...ageCategoryData.options.scales.x,
                                                            ticks: {
                                                                callback: function(value) {
                                                                    return monthNames[Number(value) % 12];
                                                                },
                                                            },
                                                        },
                                                    },
                                                    plugins: {
                                                        ...ageCategoryData.options.plugins, // Include other plugins options if any
                                                        legend: {
                                                            display: ageCategoryData.selectedOption !== "All", // Hide legend if "All" is selected
                                                        },
                                                    },
                                                },
                                                maintainAspectRatio: true,
                                            });
                                        }
                                    });

                                    window.addEventListener('resize', function () {
                                        Chart.helpers.each(Chart.instances, function(instance){
                                            instance.resize();
                                        });
                                    });

                                    window.onload = function() {
                                        setTimeout(() => {
                                            window.print();
                                            window.close();
                                        }, 2000);
                                    };
                                </script>
                            </body>
                        </html>
                    `);
                    
                    printWindow.document.close();
                    printWindow.focus();
                }
            }

            if(serviceDataChart) {
                // Count how many keys don't have datasets
                const nonEmptyDatasetCount = Object.keys(serviceDataChart)
                    .filter(key => key !== 'title' && serviceDataChart[key].data.datasets && serviceDataChart[key].data.datasets.length > 0)
                    .length;

                const pageHeight = nonEmptyDatasetCount === 4 ? "888.1mm" : ["236.84mm", "453.8mm", "671.1mm"][Math.min(nonEmptyDatasetCount - 1, 2)];

                // Open a new document
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <meta charset="UTF-8" />
                                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                <title>${serviceDataChart.title}</title>
                                <script src="https://cdn.tailwindcss.com"></script>
                                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                                <style>
                                    body{visibility:hidden;background-color:gray}@media print{#chart-title,.chart{width:100%!important}*{-webkit-print-color-adjust:exact;color-adjust:exact;print-color-adjust:exact}@page{margin:0;size:400mm ${pageHeight};orientation:landscape}body{visibility:visible;background-color:white}.bg-almond{background-color:#f8e9d3}.bg-green{background-color:green}.resize-icon{display:none!important}#myChart{page-break-inside:avoid;break-inside:avoid;padding-top:2rem;padding-bottom:2rem;margin-top:0;margin-bottom:0;padding-left:2rem!important;padding-right:2rem!important}.chart-container canvas{width:100%!important;height:90%!important}.chart{height:788px!important;flex-direction:row!important}.legend-container{height:fit-content!important;max-width:20rem!important}.legend-list{padding-bottom:0!important}.title-menu{flex-direction:row!important}}
                                </style>
                            </head>
                            <body>
                                ${input.outerHTML}
                                <script>
                                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                    
                                    const chartsData = ${JSON.stringify(serviceDataChart)};
                                    const canvasElements = document.querySelectorAll('.chart-container canvas');

                                    const valueTypes = ["male", "female", "total"];
                                    const ageCategories = ["10-14", "15-19", "20-49", "Teenage Pregnancy"];

                                    let indexCounter = 0; // Initialize an index counter

                                    // Create charts for age categories
                                    ageCategories.forEach(ageCategory => {
                                        if (chartsData[ageCategory]) {
                                            const ageCategoryData = chartsData[ageCategory];
                                            // Check if the data for "Teenage Pregnancy" is empty or if it has no datasets
                                            const isEmpty = Object.keys(ageCategoryData).length === 0 || (ageCategoryData.data && ageCategoryData.data.datasets.length === 0);
                                            if (!isEmpty) {
                                                const ctx = canvasElements[indexCounter]; // Use indexCounter to map canvas
                                                if (ctx) {
                                                    // Initialize the chart for ageCategory
                                                    new Chart(ctx.getContext('2d'), {
                                                        type: 'line',
                                                        data: ageCategoryData.data,
                                                        options: {
                                                            ...ageCategoryData.options,
                                                            responsive: false,
                                                            scales: {
                                                                x: ageCategoryData.options.scales ? {
                                                                    ...ageCategoryData.options.scales.x,
                                                                    ticks: {
                                                                        callback: function(value) {
                                                                            return monthNames[Number(value) % 12];
                                                                        },
                                                                    },
                                                                } : undefined, // Handle cases where scales might be undefined
                                                            },
                                                            plugins: {
                                                                ...ageCategoryData.options.plugins,
                                                                legend: {
                                                                    display: ageCategoryData.selectedOption !== "All",
                                                                },
                                                            },
                                                        },
                                                        maintainAspectRatio: true,
                                                    });
                                                    indexCounter++; // Increment counter after chart creation
                                                }
                                            }
                                        }
                                    });

                                    // Create charts for value types
                                    valueTypes.forEach(valueType => {
                                        if (chartsData[valueType]) {
                                            const valueTypeData = chartsData[valueType];
                                            const isEmpty = Object.keys(valueTypeData).length === 0 || (valueTypeData.data && valueTypeData.data.datasets.length === 0);

                                            // Check if the datasets array is empty
                                            if (!isEmpty) {
                                                const ctx = canvasElements[indexCounter]; // Use indexCounter to map canvas
                                                if (ctx) {
                                                    // Initialize the chart for valueType
                                                    new Chart(ctx.getContext('2d'), {
                                                        type: 'line',
                                                        data: valueTypeData.data,
                                                        options: {
                                                            ...valueTypeData.options,
                                                            responsive: false,
                                                            scales: {
                                                                x: valueTypeData.options.scales ? {
                                                                    ...valueTypeData.options.scales.x,
                                                                    ticks: {
                                                                        callback: function(value) {
                                                                            return monthNames[Number(value) % 12];
                                                                        },
                                                                    },
                                                                } : undefined, // Handle cases where scales might be undefined
                                                            },
                                                            plugins: {
                                                                ...valueTypeData.options.plugins,
                                                                legend: {
                                                                    display: valueTypeData.selectedOption !== "All",
                                                                },
                                                            },
                                                        },
                                                        maintainAspectRatio: true,
                                                    });
                                                    indexCounter++; // Increment counter after chart creation
                                                }
                                            }
                                        }
                                    });

                                    window.addEventListener('resize', function () {
                                        Chart.helpers.each(Chart.instances, function(instance){
                                            instance.resize();
                                        });
                                    });

                                    window.onload = function() {
                                        setTimeout(() => {
                                            window.print();
                                            window.close();
                                        }, 2000);
                                    };
                                </script>
                            </body>
                        </html>
                    `);
                    
                    printWindow.document.close();
                    printWindow.focus();
                }
            }
        }
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

    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [currentRef, setCurrentRef] = useState(chartRef.current?.dataset.isSubmitted);

    useEffect(() => {
        if (!isLoading && chartRef.current) {
            const currentIsSubmitted = chartRef.current.dataset.isSubmitted;
            
            // Only proceed if the current value is different from the previous value
            if (currentIsSubmitted !== currentRef) {
                setCurrentRef(currentIsSubmitted); // Update the ref to the current value

                const checkNoSubmittedReport = () => {
                    if (chartRef.current) {
                        const hasNoSubmittedReport = chartRef.current.dataset.isSubmitted === 'false';
                        setIsButtonDisabled(hasNoSubmittedReport);
                    }
                };

                const observer = new MutationObserver(checkNoSubmittedReport);
                checkNoSubmittedReport(); // Initial check
                observer.observe(chartRef.current, { attributes: true, childList: true, subtree: true });

                return () => {
                    observer.disconnect();
                };
            }
        }
    }, [chartRef.current?.dataset.isSubmitted, isLoading]); // Depend on dataset.isSubmitted and isLoading

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
                                    className={`transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-white inline-flex justify-center items-center font-medium rounded-lg px-4 py-2.5 text-center text-nowrap flex-1
                                    ${!isButtonDisabled ? "bg-green hover:bg-[#009900] focus:ring-4 focus:ring-blue-300 focus:outline-none" : "bg-gray-400 cursor-not-allowed opacity-50"}
                                    `}
                                    disabled={isButtonDisabled}
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
