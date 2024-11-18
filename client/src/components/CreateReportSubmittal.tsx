import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { ReportSubmittalsData } from "../hooks/useReportSubmissions";
import { useReportSubmissions } from "../hooks/useReportSubmissions";
import { useLoading } from "../context/LoadingContext";

interface CreateReportSubmittalProps {
    isOpen: boolean;
    toggleForm: () => void;
    fetchEarliestAndLatestDates: () => {};
}

const CreateReportSubmittal: React.FC<CreateReportSubmittalProps> = ({
    isOpen,
    toggleForm,
    fetchEarliestAndLatestDates,
}) => {
    if (!isOpen) return null;

    const { submitReportSubmittal, error: reportSubmissionErrorChild } =
        useReportSubmissions();
    const { isLoading } = useLoading();

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    const [formData, setFormData] = useState<ReportSubmittalsData>({
        report_month: today.getMonth() + 1, // Months are zero-indexed
        report_year: today.getFullYear(),
        due_date: formattedToday, // Initialize with today's date as a string
    });

    useEffect(() => {
        if (formData.report_month && formData.report_year) {
            // Create a date for the first day of the selected month and year
            const firstDayOfMonth = new Date(
                formData.report_year,
                formData.report_month - 1,
                1
            );

            // Manually format date to YYYY-MM-DD
            const year = firstDayOfMonth.getFullYear();
            const month = String(firstDayOfMonth.getMonth() + 1).padStart(
                2,
                "0"
            ); // Months are 0-indexed
            const day = String(firstDayOfMonth.getDate()).padStart(2, "0");

            const minDateFormatted = `${year}-${month}-${day}`;
            setMinDate(minDateFormatted);

            // Update due_date if it's before the new minDate
            if (new Date(formData.due_date) < new Date(minDateFormatted)) {
                setFormData((prevData) => ({
                    ...prevData,
                    due_date: minDateFormatted,
                }));
            }
        }
    }, [formData.report_month, formData.report_year]);

    const [minDate, setMinDate] = useState<string>(formattedToday);

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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (name === "month-year") {
            const [year, month] = value.split("-");
            setFormData((prevData) => ({
                ...prevData,
                report_year: parseInt(year, 10),
                report_month: parseInt(month, 10),
            }));
        } else if (name === "due-date") {
            setFormData((prevData) => ({
                ...prevData,
                due_date: value, // Store the date as a string
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const result = await submitReportSubmittal(formData);

        if (result) {
            toggleForm();
            fetchEarliestAndLatestDates(); // Uncomment if you have a way to fetch this here
        }
    };

    return (
        <div
            id="crud-modal"
            tabIndex={-1}
            aria-hidden={!isOpen}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <div className="relative w-full max-w-md max-h-full p-4">
                <div className="relative bg-white rounded-lg shadow">
                    {/* Modal header */}
                    <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5">
                        <h3 className="text-lg font-semibold text-gray-900 ">
                            Create Report Submittal
                        </h3>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 "
                            onClick={toggleForm}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Modal body */}
                    <form onSubmit={handleSubmit} className="p-4 md:p-5">
                        {reportSubmissionErrorChild && (
                            <div
                                className="flex items-center gap-2 p-4 mb-6 text-sm text-red-800 bg-red-100 rounded-lg"
                                role="alert"
                            >
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="color-[#d66666]"
                                />
                                <span className="sr-only">Info</span>
                                <div>{reportSubmissionErrorChild}</div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div className="col-span-1">
                                <label
                                    htmlFor="month-year"
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                >
                                    Month and Year
                                </label>
                                <input
                                    type="month"
                                    name="month-year"
                                    id="month-year"
                                    value={`${formData.report_year}-${String(
                                        formData.report_month
                                    ).padStart(2, "0")}`}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                />
                            </div>
                            <div className="col-span-1">
                                <label
                                    htmlFor="due-date"
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                >
                                    Due Date
                                </label>
                                <input
                                    min={minDate}
                                    type="date"
                                    name="due-date"
                                    id="due-date"
                                    value={formData.due_date}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                />
                                <p
                                    id="due-date-display"
                                    className="mt-2 text-sm text-gray-600"
                                >
                                    {formatDateForDisplay(formData.due_date)}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between gap-2 mt-10">
                            <button
                                type="submit"
                                className="transition-all text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
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
                                {isLoading
                                    ? "Creating report submittal..."
                                    : "Create Report Submittal"}
                            </button>
                            <button
                                type="button"
                                onClick={toggleForm}
                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateReportSubmittal;
