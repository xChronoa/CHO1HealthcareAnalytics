import { useState, useCallback } from "react";
import { baseAPIUrl } from "../config/apiConfig";

interface UseReportStatus {
    loading: boolean;
    error: string | null;
    statuses: ReportStatus[];
    earliestDate: string;
    latestDate: string;
    fetchReportStatuses: (
        reportYear: number,
        reportMonth: number
    ) => Promise<void>;
    fetchEarliestAndLatestDates: (barangayId: number | null) => Promise<void>;
}

interface ReportStatus {
    report_status_id: number;
    report_submission_id: number;
    report_type: string;
    barangay_id: number;
    barangay_name: string;
    submitted_at: string;
}

export const useReportStatus = (): UseReportStatus => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [statuses, setStatuses] = useState<ReportStatus[]>([]);
    const [earliestDate, setEarliestDate] = useState<string>("");
    const [latestDate, setLatestDate] = useState<string>("");

    const fetchReportStatuses = useCallback(
        async (reportYear: number, reportMonth: number) => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${baseAPIUrl}/statuses/report-status`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            report_year: reportYear,
                            report_month: reportMonth,
                        }),
                    }
                );

                if (!response.ok) {
                    if (response.status === 422) {
                        throw new Error("Invalid input parameters.");
                    } else {
                        throw new Error(
                            "An error occurred while fetching report statuses."
                        );
                    }
                }

                const result = await response.json();

                if (result.success) {
                    if (Array.isArray(result.data)) {
                        setStatuses(result.data);
                    } else {
                        throw new Error("Unexpected data format.");
                    }
                } else {
                    throw new Error(result.message || "An error occurred.");
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchEarliestAndLatestDates = useCallback(
        async (barangayId: number | null) => {
            setLoading(true);
            setError(null);

            try {
                const url = `${baseAPIUrl}/statuses/min-max`; // The URL remains the same

                // Make the POST request
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json", // Specify the content type
                        Accept: "application/json",
                    },
                    credentials: "include", // Ensure credentials are included for authentication
                    body: JSON.stringify({ barangay_id: barangayId }), // Send barangayId in the body
                });

                // Check if the response is okay
                if (!response.ok) {
                    throw new Error(
                        "An error occurred while fetching the earliest and latest dates."
                    );
                }

                // Parse the response JSON
                const result = await response.json();
                if (result.success) {
                    setEarliestDate(result.data.earliest_date);
                    setLatestDate(result.data.latest_date);
                } else {
                    throw new Error(result.message || "An error occurred.");
                }
            } catch (error: any) {
                setError(error.message);
                setEarliestDate("");
                setLatestDate("");
            } finally {
                setLoading(false);
            }
        },
        [] // Dependency array for useCallback
    );

    return {
        statuses,
        loading,
        error,
        earliestDate,
        latestDate,
        fetchReportStatuses,
        fetchEarliestAndLatestDates,
    };
};
