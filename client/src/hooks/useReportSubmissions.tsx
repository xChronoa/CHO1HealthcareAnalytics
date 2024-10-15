import { useCallback, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { baseAPIUrl } from "../config/apiConfig";
import { useLoading } from "../context/LoadingContext";

const alert = withReactContent(Swal);

export interface ReportSubmittalsData {
    report_month: number;
    report_year: number;
    due_date: string;
}

interface UseReportSubmission {
    error: string | null;
    submissions: ReportSubmission[];
    earliestDate: string;
    latestDate: string;
    pendingReportCount: number;
    m1Reports: Report[];
    m2Reports: Report[];
    submitReportSubmittal: (
        reportSubmittalDetails: ReportSubmittalsData
    ) => Promise<boolean>;
    fetchReportSubmissions: (
        reportYear: number,
        reportMonth: number,
        status: string,
        barangayId?: number
    ) => Promise<void>;
    fetchEarliestAndLatestDates: () => Promise<void>;
    fetchPendingReportCount: () => Promise<void>;
    fetchReportSubmissionsForBarangay: () => Promise<void>;
}

export interface ReportSubmission {
    barangay_id: number;
    report_submission_id: number;
    report_year: number;
    report_month: number;
    due_date: string;
    report_type: string;
    status: string;
    barangay_name?: string;
}

export interface Report {
    report_submission_id: number;
    report_month_year: string; // Example format: "MM-YYYY"
    status: string;
};

export const useReportSubmissions = (): UseReportSubmission => {
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<ReportSubmission[]>([]);
    const [earliestDate, setEarliestDate] = useState<string>("");
    const [latestDate, setLatestDate] = useState<string>("");
    const [pendingReportCount, setPendingReportCount] = useState<number>(0);

    const [m1Reports, setM1Reports] = useState<Report[]>([]);
    const [m2Reports, setM2Reports] = useState<Report[]>([]);

    const submitReportSubmittal = useCallback(
        async (
            reportSubmittalDetails: ReportSubmittalsData
        ): Promise<boolean> => {
            const result = await alert.fire({
                title: "Are you sure you want to create this report submission?",
                text: "You won't be able to modify this upon creation.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, create it!",
                cancelButtonText: "No, cancel!",
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

            try {
                incrementLoading();
                setError(null);

                const response = await fetch(
                    `${baseAPIUrl}/submissions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify(reportSubmittalDetails),
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    if (response.status === 422) {
                        throw new Error(
                            "Report template for this year and month already exists."
                        );
                    } else {
                        throw new Error(
                            "An error occured while attempting to create report submissions."
                        );
                    }
                }

                return true;
            } catch (error: any) {
                setError(error.message);
                return false;
            } finally {
                decrementLoading();
            }
        },
        []
    );

    const fetchReportSubmissions = useCallback(
        async (
            reportYear: number,
            reportMonth: number,
            status: string,
            barangayId?: number
        ) => {
            incrementLoading();
            setError(null);

            try {
                const response = await fetch(
                    `${baseAPIUrl}/submissions/month-year`,
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
                            status,
                            ...(barangayId !== undefined
                                ? { barangay_id: barangayId }
                                : {}),
                        }),
                    }
                );

                if (!response.ok) {
                    if (response.status === 422) {
                        throw new Error("Invalid input parameters.");
                    } else {
                        throw new Error(
                            "An error occurred while fetching report submissions."
                        );
                    }
                }

                const result = await response.json();

                if (result.success) {
                    if (Array.isArray(result.data)) {
                        setSubmissions(result.data);
                    } else {
                        throw new Error("Unexpected data format.");
                    }
                } else {
                    throw new Error(result.message || "An error occurred.");
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        },
        []
    );

    const fetchPendingReportCount = useCallback(async () => {
        try {
            incrementLoading();
            setError(null);

            const response = await fetch(
                `${baseAPIUrl}/submissions/pending`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                if (response.status === 422) {
                    throw new Error("Invalid input parameters.");
                } else {
                    throw new Error(
                        "An error occurred while fetching report submissions."
                    );
                }
            }

            const result = await response.json();
            setPendingReportCount(result.count);
        } catch (error: any) {
            setError(error.message);
        } finally {
            decrementLoading();
        }
    }, []);

    const fetchEarliestAndLatestDates = useCallback(async () => {
        try {
            incrementLoading();
            setError(null);
            const response = await fetch(
                `${baseAPIUrl}/submissions/min-max`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "An error occurred while fetching the earliest and latest dates."
                );
            }

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
            decrementLoading();
        }
    }, []);

    const fetchReportSubmissionsForBarangay = useCallback(async () => {
        try {
            incrementLoading();
            setError(null);
    
            const response = await fetch(
                `${baseAPIUrl}/submissions/barangay-reports`, // Adjusted to the correct route
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                }
            );
    
            if (!response.ok) {
                if (response.status === 422) {
                    throw new Error("Invalid input parameters.");
                } else {
                    throw new Error("An error occurred while fetching report submissions.");
                }
            }
    
            const result = await response.json();

            // Directly access m1 and m2 from result
            const m1Reports = result.data.m1 || [];
            const m2Reports = result.data.m2 || [];
    
            // Set the reports in state
            setM1Reports(m1Reports);
            setM2Reports(m2Reports);
    
            // Optionally, set the pending report count if needed
            setPendingReportCount(m1Reports.length + m2Reports.length);
        } catch (error: any) {
            setError(error.message);
        } finally {
            decrementLoading();
        }
    }, []);

    return {
        error,
        submissions,
        earliestDate,
        latestDate,
        pendingReportCount,
        m1Reports,
        m2Reports,
        submitReportSubmittal,
        fetchReportSubmissions,
        fetchPendingReportCount,
        fetchEarliestAndLatestDates,
        fetchReportSubmissionsForBarangay
    };
};
