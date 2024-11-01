import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Custom Hook
import { useReportStatus } from "../../hooks/useReportStatus";

// Components
import SubmittedM1 from "./SubmittedM1";
import SubmittedM2 from "./SubmittedM2";

const SubmittedReports: React.FC = () => {
    // State variables to manage section and selected date
    const [section, setSection] = useState<string>("m1");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [barangayId, setBarangayId] = useState<number | null>(null);
    const [barangayName, setBarangayName] = useState<string | null>(null);

    // Custom hook to fetch report status data
    const { fetchEarliestAndLatestDates, earliestDate, latestDate } = useReportStatus();
    const location = useLocation(); // Access the location object to retrieve passed state

    // Handle section toggle between M1 and M2
    const handleToggle = (selectedSection: string) => {
        setSection(selectedSection);
    };

    // Get the button class based on the current selected section
    const getButtonClass = (currentSection: string) =>
        `shadow-md shadow-[#a3a19d] px-4 py-2 ${
            currentSection === section ? "bg-green text-white" : "bg-slate-200 text-black"
        }`;

    // Handle changes in the date input field
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDateValue = event.target.value; // Format: YYYY-MM
        setSelectedDate(selectedDateValue);
    };

    // Set the selected date to the latest date on mount
    useEffect(() => {
        if (latestDate) {
            setSelectedDate(latestDate);
        }
    }, [latestDate]);

    // Update selected month and year when the selected date changes
    useEffect(() => {
        if (selectedDate) {
            const [year, month] = selectedDate.split("-");
            setSelectedMonth(month);
            setSelectedYear(year);
        }
    }, [selectedDate]);

    // Use location state to get the barangayId (if passed from previous view)
    useEffect(() => {
        if (location.state && location.state.barangayId && location.state.barangayName) {
            setBarangayId(location.state.barangayId);
            setBarangayName(location.state.barangayName);
        }
    }, [location.state]);

    // Fetch the earliest and latest report dates when the component mounts
    useEffect(() => {
        if(barangayId) {
            fetchEarliestAndLatestDates(barangayId);
        }
        
        if(!location.state) {
            fetchEarliestAndLatestDates();
        }
    }, [fetchEarliestAndLatestDates, barangayId]);

    return (
        <div className="flex flex-col items-center justify-center w-full px-2 py-12 sm:px-10">
            <header className="w-full mb-4">
                <h1 className="mb-2 text-2xl font-bold">Submitted Reports</h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>

            {/* Toggle buttons for selecting report section and date input */}
            <div className="flex flex-col items-center justify-between w-full gap-5 transition-all sm:flex-row toggle-sections">
                <div className="order-3 tab-container sm:-order-none">
                    <button
                        type="button"
                        onClick={() => handleToggle("m1")}
                        className={`${getButtonClass("m1")} rounded-tl-lg rounded-bl-lg`}
                    >
                        M1 Data
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggle("m2")}
                        className={`${getButtonClass("m2")} rounded-tr-lg rounded-br-lg`}
                    >
                        M2 Data
                    </button>
                </div>
                <div className="flex flex-col order-2 sm:-order-none justify-self-end">
                    <label htmlFor="report-date" className="text-center text-gray-500 ">
                        Report Date
                    </label>
                    <input
                        name="report-date"
                        type="month"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={earliestDate}
                        max={latestDate}
                        className="px-6 py-2 text-left rounded-lg shadow-md shadow-[#a3a19d]"
                        disabled={latestDate === null}
                    />
                </div>
            </div>

            {/* Section to display submitted reports based on selected date and section */}
            <section className="flex flex-col items-center justify-center w-full report">
                {selectedDate !== "" ? (
                    section === "m1" ? (
                        <div className="flex flex-col items-center justify-center w-full overflow-x-auto">
                            <SubmittedM1 barangayId={barangayId} barangayName={barangayName} selectedMonth={selectedMonth} selectedYear={selectedYear}  />
                        </div>
                    ) : (
                        section === "m2" && (
                            <div className="flex flex-col items-center justify-center w-full overflow-x-auto">
                                <SubmittedM2 barangayId={barangayId} barangayName={barangayName} selectedMonth={selectedMonth} selectedYear={selectedYear} />
                            </div>
                        )
                    )
                ) : (
                    <div className="w-full p-12 mt-4 bg-white rounded-lg shadow-md no-submitted-report shadow-gray-400">
                        <h1 className="text-center">
                            No submitted reports were found for Barangay {barangayName}. 
                        </h1>
                    </div>
                )}
            </section>
        </div>
    );
};

export default SubmittedReports;
