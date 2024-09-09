import React, { useState } from "react";
import { useReportStatus } from "../../hooks/useReportStatus";
import Loading from "../../components/Loading";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";

const History: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<string>("");

    const {
        statuses,
        loading: reportStatusLoading,
        error: reportStatusError,
        earliestDate,
        latestDate,
        fetchReportStatuses,
        fetchEarliestAndLatestDates,
    } = useReportStatus();

    useEffectAfterMount(() => {
        // Fetch earliest and latest dates on component mount
        fetchEarliestAndLatestDates();
    }, [fetchEarliestAndLatestDates]);

    useEffectAfterMount(() => {
        if (latestDate) {
            setSelectedDate(latestDate);
        }

        // Fetch report statuses whenever selectedDate changes
        if (selectedDate) {
            const [year, month] = selectedDate.split("-").map(Number);
            fetchReportStatuses(year, month);
        }
    }, [selectedDate, latestDate, fetchReportStatuses]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="mb-4">
                    <h1 className="mb-2 text-2xl font-bold">
                        Submittals History
                    </h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>
                <section className="flex flex-col items-start">
                    {/* Filter by month */}
                    <div className="flex items-center self-end gap-2 mb-4">
                        <label
                            htmlFor="report-date"
                            className="w-full font-medium text-nowrap"
                        >
                            Filter:
                        </label>
                        <input
                            name="report-date"
                            type="month"
                            min={earliestDate}
                            max={latestDate}
                            onChange={handleDateChange}
                            value={selectedDate}
                            className="px-2 py-1 border rounded-md"
                        />
                    </div>
                    <div className="w-full table-container">
                        <table className="w-full text-center">
                            {/* Table Header */}
                            <thead className="bg-white rounded-[16px] shadow-lg outline outline-1 outline-black uppercase">
                                <tr>
                                    <th className="px-4 py-2 rounded-tl-[16px] rounded-bl-[16px]">
                                        Name of Report
                                    </th>
                                    <th className="px-4 py-2 rounded-tr-[16px] rounded-br-[16px]">
                                        Date Submitted
                                    </th>
                                </tr>
                            </thead>
                            {/* Table Contents */}
                            <tbody>
                                {reportStatusLoading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-2 text-center"
                                        >
                                            Loading report statuses...
                                        </td>
                                    </tr>
                                ) : reportStatusError ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-2 text-center text-red-500"
                                        >
                                            Error loading report statuses:{" "}
                                            {reportStatusError}
                                        </td>
                                    </tr>
                                ) : statuses.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-2 text-center"
                                        >
                                            No report status found for the
                                            selected report date.
                                        </td>
                                    </tr>
                                ) : (
                                    statuses.map((status) => (
                                        <tr key={status.report_status_id}>
                                            <td className="px-4 py-2 uppercase">
                                                {status.report_type}
                                            </td>
                                            <td className="px-4 py-2">
                                                {new Date(
                                                    status.submitted_at
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            {reportStatusLoading && <Loading />}
        </>
    );
};

export default History;
