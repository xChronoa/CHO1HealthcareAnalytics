import { useState, useEffect } from "react";
import CreateReportSubmittal from "../../components/CreateReportSubmittal";
import { useReportSubmissions } from "../../hooks/useReportSubmissions";

const Transaction: React.FC = () => {
    const {
        error: reportSubmissionErrorParent,
        submissions,
        earliestDate,
        latestDate,
        dueDate,
        fetchReportSubmissions,
        fetchEarliestAndLatestDates,
    } = useReportSubmissions();

    const [selectedDate, setSelectedDate] = useState<string>(latestDate || "");
    const [tab, setTab] = useState<string>("all");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch the earliest and latest dates when the component mounts
        fetchEarliestAndLatestDates();
    }, [fetchEarliestAndLatestDates]);

    useEffect(() => {
        // Fetch submissions when the selected date or tab changes
        if (selectedDate) {
            fetchReportSubmissions(
                parseInt(selectedDate.split("-")[0]), // Extract year
                parseInt(selectedDate.split("-")[1]), // Extract month
                tab
            );
        }
    }, [selectedDate, latestDate, fetchReportSubmissions, tab]);

    useEffect(() => {
        if (latestDate) {
            setSelectedDate(latestDate);
        }
    }, [latestDate])

    const toggleForm = () => {
        setIsOpen((prev) => !prev);
        document.body.style.overflow = isOpen ? "" : "hidden";
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    const toggleTab = (tabName: string) => {
        setTab(tabName);
    };

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
                <header className="flex flex-col gap-1 mb-4">
                    <div className="flex flex-row items-center justify-between">
                        <h1 className="mb-2 text-2xl font-bold">Reports</h1>
                        <button
                            onClick={toggleForm}
                            className="bg-green inline-flex items-center text-white font-semibold text-[.8rem] sm:text-md px-4 py-2 rounded-md hover:opacity-85"
                        >
                            <svg
                                className="w-5 h-5 me-1 -ms-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            New Report Submittal
                        </button>
                    </div>
                    <div className="dividing-line w-full h-[2px] bg-black" />
                </header>
                <section className="flex flex-col items-start">
                    <div className="flex flex-row flex-wrap items-center justify-start w-full gap-6 mb-6 sm:justify-between lg:gap-0 md:flex-row filter">
                        <div className="flex flex-row justify-between gap-8 wrap-dates">
                            {/* Filter by month and year */}
                            <div className="flex flex-row items-center justify-center gap-2 text-xs sm:gap-5 sm:text-sm">
                                <label htmlFor="month-from">From:</label>
                                <input
                                    type="month"
                                    name="month-from"
                                    id="month-from"
                                    min={earliestDate}
                                    max={latestDate}
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="p-[.45rem] text-center rounded-lg shadow-md w-fit shadow-gray-400"
                                />
                            </div>

                            <div className="flex flex-row items-center justify-center gap-2 text-xs pointer-events-none sm:gap-5 sm:text-sm">
                                <label htmlFor="due-date">Due:</label>
                                <span className="p-2 bg-white rounded-lg shadow-md shadow-gray-400">
                                    {formatDateForDisplay(dueDate) ?? "mm/dd/yyyy"}
                                </span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-row justify-between w-full text-sm font-medium text-center text-gray-500 lg:w-fit sm:flex-wrap">
                            <button
                                type="button"
                                onClick={() => toggleTab("all")}
                                className={`flex-1 px-4 py-3 me-2 ${
                                    tab === "all"
                                        ? "text-green border-b-2 border-green"
                                        : "hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleTab("pending")}
                                className={`flex-1 px-4 py-3 me-2 ${
                                    tab === "pending"
                                        ? "text-green border-b-2 border-green"
                                        : "hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                Pending
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleTab("submitted")}
                                className={`flex-1 px-4 py-3 me-2 ${
                                    tab === "submitted"
                                        ? "text-green border-b-2 border-green"
                                        : "hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                Submitted
                            </button>
                        </div>
                    </div>
                    <div className="w-full table-container">
                        <table className="w-full text-xs text-center sm:text-sm md:text-base">
                            {/* Table Header */}
                            <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                                <tr>
                                    <th className="text-sm px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">
                                        Barangay
                                    </th>
                                    <th className="px-4 py-2 text-sm">
                                        Date Submitted
                                    </th>
                                    <th className="text-sm px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            {/* Table Contents */}
                            <tbody>
                                {reportSubmissionErrorParent ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-2 text-center text-red-500"
                                        >
                                            Error loading report statuses:{" "}
                                            {reportSubmissionErrorParent}
                                        </td>
                                    </tr>
                                ) : submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={3}>
                                            <div className="w-full p-12 bg-white rounded-lg shadow-md no-submitted-report shadow-gray-400">
                                                <h1 className="text-center">
                                                    No pending submissions have been made for any barangays yet.
                                                </h1>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((submission) => (
                                        <tr key={submission.barangay_id}>
                                            <td className="px-4 py-2 font-semibold uppercase">
                                                {submission.barangay_name ||
                                                    "N/A"}
                                            </td>
                                            <td className={`flex flex-col sm:flex-row justify-center items-center gap-2 px-4 py-2 text-nowrap font-semibold uppercase ${submission.status === "pending" ? "text-red-500" : "text-green"}`}>
                                                <>
                                                {(() => {
                                                    if (submission.submitted_at) {
                                                        // Format the date if `submitted_at` exists
                                                        const formattedDate = new Date(submission.submitted_at).toLocaleDateString("en-US", {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        });
                                                        return formattedDate;
                                                    } else {
                                                        // Show placeholder if `submitted_at` is missing
                                                        return "Not Submitted";
                                                    }
                                                })()}
                                                <span className="text-xs italic text-yellow-600 text-nowrap sm:text-wrap">
                                                    {submission.status === "submitted late" && submission.tardy_days > 0 
                                                        ? ` (${submission.tardy_days} day${submission.tardy_days > 1 ? "s" : ""} late)` 
                                                        : ""}
                                                </span>
                                                </>
                                            </td>
                                            <td className={`px-4 py-2 font-semibold uppercase ${submission.status.toLowerCase() === "pending" ? "text-red-500" : submission.status.toLowerCase() === "submitted late" ? "text-yellow-600" : "text-green"}`}>
                                                {submission.status}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {isOpen && (
                <CreateReportSubmittal
                    isOpen={isOpen}
                    toggleForm={toggleForm}
                    fetchEarliestAndLatestDates={fetchEarliestAndLatestDates}
                />
            )}
        </>
    );
};

export default Transaction;
