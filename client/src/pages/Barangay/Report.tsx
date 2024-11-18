// React and React Router
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Third-party Libraries
import Swal from "sweetalert2";

// Context Providers
import { useLoading } from "../../context/LoadingContext";

// Custom Hooks
import { useServices } from "../../hooks/useServices";
import { useDisease, Disease } from "../../hooks/useDisease";
import { useReportSubmissions } from "../../hooks/useReportSubmissions";
import { useAgeCategory, AgeCategory } from "../../hooks/useAgeCategory";

// Components
import { M1Report } from "./M1Report";
import { MorbidityForm } from "./MorbidityForm";

// Type Definitions
import { IncompleteData, IncompleteUpdate } from "../../types/IncompleteForm";
import { InputValues, M2FormData } from "../../types/M2FormData";

// Configuration
import { baseAPIUrl } from "../../config/apiConfig";

const Report: React.FC = () => {
    /**
     * 
     * State Management
     * 
     */
    const [section, setSection] = useState<string>("m1");
    const [reportData, setReportData] = useState({
        m1Report: {},
        m2Report: {},
    });

    const [incompleteSections, setIncompleteSections] = useState<Partial<IncompleteData>>(() => {
        const storedData = localStorage.getItem("incompleteSections");
        return storedData ? JSON.parse(storedData) : {};
    });

    const [m1ReportId, setM1ReportId] = useState<number | null>(null);
    const [m2ReportId, setM2ReportId] = useState<number | null>(null);
    const [minDate, setMinDate] = useState<string>('');
    const [maxDate, setMaxDate] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(maxDate || '');

    /**
     * 
     * Fetch Hooks
     * 
     **/ 
    const { services, fetchServices } = useServices();
    const { diseases, fetchDiseases } = useDisease();
    const { diseases: formDiseases, fetchDiseases: fetchFormDiseases } = useDisease();
    const { ageCategories, fetchAgeCategories } = useAgeCategory();
    const { fetchReportSubmissionsForBarangay, m1Reports, m2Reports } = useReportSubmissions();
    const { isLoading, incrementLoading, decrementLoading } = useLoading();
    const navigate = useNavigate();

    /**
     * 
     * Effect Hooks
     * 
     */
    useEffect(() => {
        const m1Data = localStorage.getItem("m1formData");
        const m2Data = localStorage.getItem("m2formData");
        
        setReportData({
            m1Report: m1Data ? JSON.parse(m1Data) : {},
            m2Report: m2Data ? JSON.parse(m2Data) : {},
        });
    }, []);

    useEffect(() => {
        fetchAgeCategories();
        fetchFormDiseases();
    }, [fetchAgeCategories, fetchFormDiseases])
    
    // Fetch services and diseases if incompleteSections is not found in localStorage
    useEffect(() => {
        const storedIncompleteSections = localStorage.getItem("incompleteSections");

        if (!storedIncompleteSections) {
            fetchServices();
            fetchDiseases();
        }
    }, [fetchServices, fetchDiseases]);

    // Update incomplete sections with service names
    useEffect(() => {
        if(services) {
            const serviceNames = services.map(service => service.service_name);
    
            if (serviceNames.length > 0) {
                const updatedSections = {
                    ...incompleteSections,
                    M1: serviceNames,
                };
    
                setIncompleteSections(updatedSections);
                localStorage.setItem("incompleteSections", JSON.stringify(updatedSections));
            }
        }
    }, [services]);

    // Update incomplete sections with disease names
    useEffect(() => {
        if(diseases) {
            const diseaseNames = diseases.map(disease => disease.disease_name);
    
            if (diseaseNames.length > 0) {
                const updatedSections = {
                    ...incompleteSections,
                    M2: diseaseNames,
                };
    
                setIncompleteSections(updatedSections);
                localStorage.setItem("incompleteSections", JSON.stringify(updatedSections));
            }
        }
    }, [diseases]);

    useEffect(() => {
        localStorage.setItem("incompleteSections", JSON.stringify(incompleteSections));
    }, [incompleteSections]);

    useEffect(() => {
        // Fetch report submissions when the component mounts
        fetchReportSubmissionsForBarangay();
    }, [fetchReportSubmissionsForBarangay]);

    useEffect(() => {
        if (m1Reports.length > 0 || m2Reports.length > 0) {
            const allReports = [...m1Reports, ...m2Reports];

            const dates = allReports.map(report => {
                const [month, year] = report.report_month_year.split('-');
                return new Date(Number(year), Number(month) - 1).getTime(); // Convert to timestamp
            });

            const minDateTimestamp = Math.min(...dates);
            const maxDateTimestamp = Math.max(...dates);

            const minDateObj = new Date(minDateTimestamp);
            const maxDateObj = new Date(maxDateTimestamp);

            // Format dates back to YYYY-MM
            const formatDate = (date: Date) => 
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            setMinDate(formatDate(minDateObj));
            setMaxDate(formatDate(maxDateObj));
        }
    }, [m1Reports, m2Reports]);

    useEffect(() => {
        if (maxDate) {
            handleDateChange({ target: { value: maxDate } } as React.ChangeEvent<HTMLInputElement>);
        }
    }, [maxDate]);


    /**
     * 
     * Event Handlers
     *  
     */
    // Handle section toggle
    const handleToggle = (selectedSection: string) => {
        setSection(selectedSection);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDateValue = event.target.value; // Get selected date in YYYY-MM format
        setSelectedDate(selectedDateValue); // Update state with selected date
    
        const [selectedYear, selectedMonth] = selectedDateValue.split('-'); // Split into year and month
        
        // Array of month names for converting numeric month to text
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
    
        const monthIndex = parseInt(selectedMonth, 10) - 1; // Convert to zero-based index
        const monthName = monthNames[monthIndex]; // Get the month name
    
        // Find matching m1 and m2 reports for the selected month and year
        const matchingM1Report = m1Reports.find(report => {
            const [reportMonth, reportYear] = report.report_month_year.split('-');
            return parseInt(reportMonth, 10) - 1 === monthIndex && reportYear === selectedYear;
        });
    
        const matchingM2Report = m2Reports.find(report => {
            const [reportMonth, reportYear] = report.report_month_year.split('-');
            return parseInt(reportMonth, 10) - 1 === monthIndex && reportYear === selectedYear;
        });
    
        // Check status of m1 and m2 reports
        let alreadySubmitted = false; // Flag to check if either report has been submitted
    
        if (matchingM1Report) {
            if (matchingM1Report.status === "submitted" || matchingM1Report.status === "submitted late") {
                alreadySubmitted = true; // Set flag if m1 report is submitted
                setM1ReportId(null); // Set ID to null if already submitted
            } else {
                setM1ReportId(matchingM1Report.report_submission_id); // Set ID if not submitted
            }
        } else {
            setM1ReportId(null); // No matching report found
        }
    
        if (matchingM2Report) {
            if (matchingM2Report.status === "submitted" || matchingM2Report.status === "submitted late") {
                alreadySubmitted = true; // Set flag if m2 report is submitted
                setM2ReportId(null); // Set ID to null if already submitted
            } else {
                setM2ReportId(matchingM2Report.report_submission_id); // Set ID if not submitted
            }
        } else {
            setM2ReportId(null); // No matching report found
        }
    
        // Show alert if either report has been submitted
        if (alreadySubmitted) {
            Swal.fire({
                icon: "info",
                title: "Already Submitted",
                text: `You have already submitted the report for the report period of ${monthName} ${selectedYear}.`,
                confirmButtonText: "OK",
            });
        }
    };

    // Callback to receive incomplete data from child components
    const handleCheckIncomplete: IncompleteUpdate = (source, incomplete) => {
        setIncompleteSections(prev => ({
            ...prev,
            [source]: incomplete,
        }));
    };

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = await Swal.fire({
            title: "Are you sure you want to submit this report?",
            text: "You won't be able to modify this upon submission.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, submit it!",
            cancelButtonText: "No, I want to review it!",
            customClass: {
                popup: "w-fit",
                title: "text-lg",
                confirmButton:
                    "transition-all bg-green text-white px-4 py-2 rounded-md hover:bg-[#009900]",
                cancelButton:
                    "transition-all bg-white border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
            },
            buttonsStyling: false,
        });

        if (!result.isConfirmed) return false;

        // Check if either report has been submitted for the selected date
        const selectedDateReports = [
            ...m1Reports.filter(report => report.report_submission_id === m1ReportId),
            ...m2Reports.filter(report => report.report_submission_id === m2ReportId),
        ];

        const alreadySubmittedReports = selectedDateReports.filter(report => 
            report.status === "submitted" || report.status === "submitted late"
        );

        if (alreadySubmittedReports.length > 0) {
            Swal.fire({
                icon: "info",
                title: "Already Submitted",
                text: `You have already submitted the report for the selected date.`,
                confirmButtonText: "OK",
            });
            return;
        }

        // Ensure report IDs are selected
        if (m1ReportId === null && m2ReportId === null) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Report Date",
                text: "Please select the report date for this submission.",
                confirmButtonText: "OK",
            });
            return;
        }

        const m1Incomplete = incompleteSections["M1"] || [];
        const m2Incomplete = incompleteSections["M2"] || [];

        if (m1Incomplete.length > 0 || m2Incomplete.length > 0) {
            // Define a dynamic section order object based on the services array
            const sectionOrder: { [key: string]: number } = {};

            // Start with predefined services
            sectionOrder["Projected Population"] = 1;
            sectionOrder["Modern FP Unmet Need"] = 1;
            sectionOrder["Family Planning"] = 2;

            // List of all services to be dynamically ordered
            const serviceOrder = [
                "B1. Prenatal Care",
                "B2. Intrapartum Care and Delivery Outcome",
                "B3. Postpartum and Newborn Care",
                "C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents",
                "C2. Nutrition Services for Infants and Children",
                "Nutritional Assessment of Children 0-59 mos. Old",
                "Deworming Services for Infants, Children and Adolescents (Community Based)",
                "School-Based Deworming Services (Annual Reporting)",
                "Soil Transmitted Helminthiasis Prevention and Control",
                "E8. Rabies Prevention and Control",
                "Part 2. Natality",
                "Management of Sick Infants and Children",
                "Non-Communicable Disease Prevention and Control Services",
                "Teenage Pregnancy"
            ];

            // Loop over serviceOrder and assign section numbers if not already assigned
            serviceOrder.forEach((service) => {
                // If the service is not already in sectionOrder, assign a section number
                if (!sectionOrder[service]) {
                    // Assign next available section number based on current sectionOrder size
                    sectionOrder[service] = Object.keys(sectionOrder).length;
                }
            });

            // Prepare incomplete sections with section numbers
            const incompleteSectionsWithNumbers = (incompleteSections: string[]) => {
                return incompleteSections.map((sectionName) => {
                    const sectionNumber = sectionOrder[sectionName] || "N/A"; // Default to "N/A" if not found in order
                    return `<li class="mb-2">Section ${sectionNumber}: ${sectionName}</li>`;
                }).join('');
            };

            Swal.fire({
                icon: "warning",
                title: "Incomplete Sections",
                html: `
                    <div class="flex flex-col items-center justify-center gap-8 w-full text-xs sm:text-sm md:text-base">
                        <h2 class="text-center mb-4 w-full sm:w-3/4">Note: Please enter a whole number greater than or equal to 0. Decimal values and negative numbers are not allowed.</h2>

                        <div class="flex flex-col items-center justify-center gap-8 md:gap-16 reports md:items-start md:flex-row md:justify-between">
                            ${m1Incomplete.length > 0 ? `
                            <div class="flex-1">
                                <h3 class="mb-3 font-semibold">M1 Report</h3>
                                <ul class="text-left mb-3 text-xs md:text-sm">
                                    ${incompleteSectionsWithNumbers(m1Incomplete)}
                                </ul>
                            </div>` : ""}

                            ${m2Incomplete.length > 0 ? `
                            <div class="flex-1">
                                <h3 class="mb-3 font-semibold">M2 Report</h3>
                                <ul class="text-left mb-3 list-disc text-xs md:text-sm">
                                    ${m2Incomplete.map(disease => `<li class="mb-2">${disease}</li>`).join("")}
                                </ul>
                            </div>` : ""}
                        </div>
                    </div>
                `,
                customClass: {
                    title: "text-sm md:text-base",
                    popup: 'incomplete-section alert',
                },
                confirmButtonText: "Check and Complete Incomplete Sections",
            });
            
            return;
        }

        try {
            incrementLoading();

            const response = await fetch(
                `${baseAPIUrl}/statuses/submit/report`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        m1Report: reportData.m1Report,
                        m2Report: transformInputValues(reportData.m2Report, formDiseases, ageCategories),
                        m1ReportId: m1ReportId,
                        m2ReportId: m2ReportId,
                    }),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                // Check for specific error status
                if (response.status === 400) {
                    const errorData = await response.json();
                    Swal.fire({
                        title: 'Error!',
                        text: errorData.error || "Bad request. Please check your input.",
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Something went wrong while submitting the report!");
                }
                return; // Exit the function after handling the error
            }

            if (response.status === 201) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Report submitted successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => navigate("/barangay"));
            }

            localStorage.clear();
        } catch (error: any) {
            Swal.fire({
                title: 'Error!',
                text: error.message || "An unexpected error occurred.", // Display specific error message
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            decrementLoading();
        }
    };

    
    // Update report data
    const setReportDatas = (type: 'm1' | 'm2', data: any) => {
        setReportData(prev => ({
            ...prev,
            [`${type}Report`]: data,
        }));
    };

    // Get button class based on the current section
    const getButtonClass = (currentSection: string) =>
        `shadow-md shadow-[#a3a19d] px-4 py-2 ${
            currentSection === section
                ? "bg-green text-white"
                : "bg-slate-200 text-black"
        }`;

    const transformInputValues = (
        inputValues: InputValues,
        diseases: Disease[],
        ageCategories: AgeCategory[],
    ): M2FormData[] => {
        const result: M2FormData[] = [];
    
        for (const [diseaseName, ageGroups] of Object.entries(inputValues)) {
            const disease = diseases.find(d => d.disease_name === diseaseName);
            if (!disease) continue;
    
            for (const [ageCategoryName, values] of Object.entries(ageGroups)) {
                const ageCategory = ageCategories.find(a => a.age_category === ageCategoryName);
                if (!ageCategory) continue;
    
                result.push({
                    disease_id: disease.disease_id,
                    disease_name: disease.disease_name,
                    age_category_id: ageCategory.age_category_id,
                    male: typeof values.M === "number" ? values.M : Number(values.M),
                    female: typeof values.F === "number" ? values.F : Number(values.F),
                });
            }
        }
    
        // Sort by disease_id and then by age_category_id
        return result.sort((a, b) => {
            if (a.disease_id !== b.disease_id) {
                return a.disease_id - b.disease_id;
            }
            return a.age_category_id - b.age_category_id;
        });
    };

    return (
        <>  
            <div className="container flex flex-col items-center justify-center py-8">
                {!maxDate ? (
                    <div className="flex flex-col w-11/12 min-h-screen">
                        <header className="mb-4">
                            <h1 className="mb-2 text-2xl font-bold">Report Submission</h1>
                            <div className="w-full h-[2px] bg-black"></div>
                        </header>
                        <div className="w-full p-12 bg-white rounded-lg border-[1px] gap-4 border-gray-400 no-submitted-report flex flex-col justify-center items-center">
                            <span className="text-center">
                                There are no pending reports awaiting action at the moment. <br />
                            </span>
                            <span className="text-center">
                                All necessary submissions are up-to-date. <br />
                            </span>
                            <span className="text-center">
                                Please check back later for any new reports that may need your attention. <br />
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-row flex-wrap items-center justify-between w-11/12 gap-5 transition-all toggle-sections">
                            <h1 className="block w-full mb-6 text-2xl font-bold text-center">
                                Report Submission
                            </h1>
                            <div className="flex flex-row order-2 w-full sm:w-fit sm:order-none tab-container flex-nowrap">
                                <button
                                    type="button"
                                    onClick={() => handleToggle("m1")}
                                    className={`flex-1 ${getButtonClass(
                                        "m1"
                                    )} rounded-l-lg`}
                                >
                                    M1 Data
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggle("m2")}
                                    className={`flex-1 ${getButtonClass(
                                        "m2"
                                    )} rounded-r-lg`}
                                >
                                    M2 Data
                                </button>
                            </div>
                            <div className="relative flex flex-col order-1 w-full sm:w-fit sm:order-none sm:flex-none">
                                <label htmlFor="report-date" className="absolute text-left text-gray-500 -inset-y-6">Report Date</label>
                                <input
                                    name="report-date"
                                    type="month"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    min={minDate}
                                    max={maxDate}
                                    className="px-6 py-2 text-left rounded-lg shadow-md shadow-[#a3a19d]"
                                />
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full px-4">
                            {section === "m1" && <M1Report setReportDatas={setReportDatas} onCheckIncomplete={handleCheckIncomplete} />}
                            {section === "m2" && <MorbidityForm setReportDatas={setReportDatas} onCheckIncomplete={handleCheckIncomplete} diseases={diseases}/>}
                            
                            <button 
                                type='submit' 
                                disabled={isLoading} 
                                className="uppercase w-full py-2 font-bold text-white transition-all bg-blue-500 rounded-lg shadow-md active:scale-[98%] hover:bg-blue-600 shadow-gray-500"
                            >
                                {isLoading ? "Submitting..." : "submit"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </>
    );
};

export default Report;
