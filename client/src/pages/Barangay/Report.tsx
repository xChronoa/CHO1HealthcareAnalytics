import { useState } from "react";
import { M1Report } from "./M1Report";
import { MorbidityForm } from "./MorbidityForm";
import Swal from "sweetalert2";
import { IncompleteData, IncompleteUpdate } from "../../types/IncompleteForm";
import { useServices } from "../../hooks/useServices";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { Disease, useDisease } from "../../hooks/useDisease";
import Loading from "../../components/Loading";
import { useReportSubmissions } from "../../hooks/useReportSubmissions";
import { AgeCategory, useAgeCategory } from "../../hooks/useAgeCategory";
import { InputValues, M2FormData } from "../../types/M2FormData";
import { baseAPIUrl } from "../../config/apiConfig";

const Report: React.FC = () => {
    const [section, setSection] = useState<string>("m1");
    const [reportData, setReportData] = useState({
        m1Report: {},
        m2Report: {},
    });

    const [incompleteSections, setIncompleteSections] = useState<Partial<IncompleteData>>(() => {
        const storedData = localStorage.getItem("incompleteSections");
        return storedData ? JSON.parse(storedData) : {};
    });

    const { services, fetchServices, loading: serviceLoading } = useServices();
    const { diseases, fetchDiseases, loading: diseaseLoading } = useDisease();
    const { diseases: formDiseases, fetchDiseases: fetchFormDiseases, loading: formDiseasesLoading } = useDisease();
    const { ageCategories, fetchAgeCategories, loading: ageCategoriesLoading } = useAgeCategory();
    const [reportLoading, setReportLoading] = useState<boolean>(false);

    useEffectAfterMount(() => {
        const m1Data = localStorage.getItem("m1formData");
        const m2Data = localStorage.getItem("m2formData");
        
        setReportData({
            m1Report: m1Data ? JSON.parse(m1Data) : {},
            m2Report: m2Data ? JSON.parse(m2Data) : {},
        });
    }, []);

    // Update report data
    const setReportDatas = (type: 'm1' | 'm2', data: any) => {
        setReportData(prev => ({
            ...prev,
            [`${type}Report`]: data,
        }));
    };

    // Handle section toggle
    const handleToggle = (selectedSection: string) => {
        setSection(selectedSection);
    };

    // Get button class based on the current section
    const getButtonClass = (currentSection: string) =>
        `shadow-md shadow-[#a3a19d] px-4 py-2 ${
            currentSection === section
                ? "bg-green text-white"
                : "bg-slate-200 text-black"
        }`;

    // Callback to receive incomplete data from child components
    const handleCheckIncomplete: IncompleteUpdate = (source, incomplete) => {
        setIncompleteSections(prev => ({
            ...prev,
            [source]: incomplete,
        }));
    };

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

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(m1ReportId === null && m2ReportId === null) {
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
            Swal.fire({
                icon: "warning",
                title: "Incomplete Sections",
                html: `
                    ${m1Incomplete.length > 0 ? `
                    <h3 class="mb-3 font-semibold">M1 Report</h3>
                    <ul class="text-left mb-3">
                        ${m1Incomplete.map(section => `<li class="mb-2">- ${section}</li>`).join("")}
                    </ul>` : ""}
                    
                    ${m2Incomplete.length > 0 ? `
                    <h3 class="mt-8 mb-3 font-semibold">M2 Report</h3>
                    <ul class="text-left mb-3">
                        ${m2Incomplete.map(disease => `<li class="mb-2">- ${disease}</li>`).join("")}
                    </ul>` : ""}
                `,
                confirmButtonText: "OK",
            });

            return;
        }

        try {
            setReportLoading(true);

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
                throw new Error("Something went wrong while submitting the report!");
            }

            if(response.status === 201) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Report submitted successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/barangay/history';
                });
            }

            localStorage.clear();
        } catch (error: any) {
            Swal.fire({
                title: 'Error!',
                text: error,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setReportLoading(false);
        }
    };

    useEffectAfterMount(() => {
        fetchAgeCategories();
        fetchFormDiseases();
    }, [fetchAgeCategories, fetchFormDiseases])

    // Fetch services and diseases if incompleteSections is not found in localStorage
    useEffectAfterMount(() => {
        const storedIncompleteSections = localStorage.getItem("incompleteSections");

        if (!storedIncompleteSections) {
            fetchServices();
            fetchDiseases();
        }
    }, [fetchServices, fetchDiseases]);

    // Update incomplete sections with service names
    useEffectAfterMount(() => {
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
    useEffectAfterMount(() => {
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

    useEffectAfterMount(() => {
        localStorage.setItem("incompleteSections", JSON.stringify(incompleteSections));
    }, [incompleteSections]);

    const { fetchReportSubmissionsForBarangay, loading: submissionLoading, error: submissionError, m1Reports, m2Reports } = useReportSubmissions();
    
    const [m1ReportId, setM1ReportId] = useState<number | null>(null);
    const [m2ReportId, setM2ReportId] = useState<number | null>(null);
    const [minDate, setMinDate] = useState<string>('');
    const [maxDate, setMaxDate] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(maxDate || '');

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDateValue = event.target.value; // Format: YYYY-MM
        setSelectedDate(selectedDateValue);

        const [selectedYear, selectedMonth] = selectedDateValue.split('-');

        // Ensure selectedMonth has leading zero if necessary
        const formattedSelectedMonth = String(selectedMonth).padStart(2, '0');
            
        // Find the corresponding m1 report
        const matchingM1Report = m1Reports.find(
            report => {
                const [reportMonth, reportYear] = report.report_month_year.split('-');

                // Ensure reportMonth has leading zero if necessary
                const formattedReportMonth = String(reportMonth).padStart(2, '0');

                return formattedReportMonth === formattedSelectedMonth && reportYear === selectedYear;
            }
        );

        // Find the corresponding m2 report
        const matchingM2Report = m2Reports.find(
            report => {
                const [reportMonth, reportYear] = report.report_month_year.split('-');

                // Ensure reportMonth has leading zero if necessary
                const formattedReportMonth = String(reportMonth).padStart(2, '0');
                
                return formattedReportMonth === formattedSelectedMonth && reportYear === selectedYear;
            }
        );

        // Set the report IDs in the state
        setM1ReportId(matchingM1Report ? matchingM1Report.report_submission_id : null);
        setM2ReportId(matchingM2Report ? matchingM2Report.report_submission_id : null);
    };

    useEffectAfterMount(() => {
        // Fetch report submissions when the component mounts
        fetchReportSubmissionsForBarangay();
    }, [fetchReportSubmissionsForBarangay]);

    useEffectAfterMount(() => {
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

    useEffectAfterMount(() => {
        const [selectedYear, selectedMonth] = selectedDate.split('-');

        // Ensure selectedMonth has leading zero if necessary
        const formattedSelectedMonth = String(selectedMonth).padStart(2, '0');
            
        // Find the corresponding m1 report
        const matchingM1Report = m1Reports.find(
            report => {
                const [reportMonth, reportYear] = report.report_month_year.split('-');

                // Ensure reportMonth has leading zero if necessary
                const formattedReportMonth = String(reportMonth).padStart(2, '0');

                return formattedReportMonth === formattedSelectedMonth && reportYear === selectedYear;
            }
        );

        // Find the corresponding m2 report
        const matchingM2Report = m2Reports.find(
            report => {
                const [reportMonth, reportYear] = report.report_month_year.split('-');

                // Ensure reportMonth has leading zero if necessary
                const formattedReportMonth = String(reportMonth).padStart(2, '0');
                
                return formattedReportMonth === formattedSelectedMonth && reportYear === selectedYear;
            }
        );

        // Set the report IDs in the state
        setM1ReportId(matchingM1Report ? matchingM1Report.report_submission_id : null);
        setM2ReportId(matchingM2Report ? matchingM2Report.report_submission_id : null);
    }, [selectedDate])

    useEffectAfterMount(() => {
        if (maxDate) {
            setSelectedDate(maxDate);
        }
    }, [maxDate]);

    return (
        <>  
            <div className="container flex flex-col items-center justify-center py-8">
                {!maxDate ? (
                    <div className="flex flex-col w-11/12 min-h-screen py-16">
                        <header className="mb-4">
                            <h1 className="mb-2 text-2xl font-bold">Report Submission</h1>
                            <div className="w-full h-[2px] bg-black"></div>
                        </header>
                        <h1 className="text-lg font-semibold text-center">
                            There are currently no pending reports.
                        </h1>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center justify-between w-11/12 gap-5 transition-all sm:flex-row toggle-sections">
                            <div className="order-3 tab-container sm:-order-none ">
                                <button
                                    type="button"
                                    onClick={() => handleToggle("m1")}
                                    className={`${getButtonClass(
                                        "m1"
                                    )} rounded-tl-lg rounded-bl-lg`}
                                >
                                    M1 Data
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggle("m2")}
                                    className={`${getButtonClass(
                                        "m2"
                                    )} rounded-tr-lg rounded-br-lg`}
                                >
                                    M2 Data
                                </button>
                            </div>
                            <h1 className="order-1 text-2xl font-bold sm:-order-none">
                                Report Submission
                            </h1>
                            <div className="flex flex-col order-2 sm:-order-none justify-self-end">
                                <label htmlFor="report-date" className="text-center text-gray-500">Report Date</label>
                                <input
                                    name="report-date"
                                    type="month"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    min={minDate}
                                    max={maxDate}
                                    className="px-6 py-2 text-left rounded-lg"
                                />
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full px-4 py-6">
                            {section === "m1" && <M1Report setReportDatas={setReportDatas} onCheckIncomplete={handleCheckIncomplete} />}
                            {section === "m2" && <MorbidityForm setReportDatas={setReportDatas} onCheckIncomplete={handleCheckIncomplete} diseases={diseases}/>}
                            
                            <button type='submit' className="uppercase w-full py-2 font-bold text-white transition-all bg-blue-500 rounded-lg shadow-md active:scale-[98%] hover:bg-blue-600 shadow-gray-500">
                                {reportLoading ? "Submitting..." : "submit"}
                            </button>
                        </form>
                    </>
                )}
            </div>
            {(serviceLoading || diseaseLoading || ageCategoriesLoading || formDiseasesLoading || submissionLoading || reportLoading) && <Loading />}
        </>
    );
};

export default Report;
