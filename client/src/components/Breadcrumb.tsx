import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useLocation, Link } from "react-router-dom";

const labels: Record<string, string> = {
    admin: "Dashboard",
    transactions: "Reports",
    barangays: "Barangay List",
    appointments: "Appointments",
    manage: "Manage Accounts",
    create: "Create Account",
    update: "Update Account",
    accounts: "Account List",
    report: "Submit Reports",
    submitted: "Submitted Reports",
    barangay: "Dashboard",
    edit: "Edit Account",
    history: "History",
};

const Breadcrumb: React.FC = () => {
    const location = useLocation();

    // Split the current path into segments
    const pathSegments: string[] = location.pathname
        .split("/")
        .filter((path) => path);

    // Helper to fetch readable label
    const getLabel = (segment: string): string =>
        labels[segment]
            ? labels[segment]
            : segment.replace(/-/g, " ").replace(/%20/g, " ");

    // Find the index of "barangays" and "submitted" in the path
    const barangaysIndex = pathSegments.indexOf("barangays");
    const submittedIndex = pathSegments.indexOf("submitted");
    const editIndex = pathSegments.indexOf("edit");

    return (
        <nav
            aria-label="breadcrumb"
            className={`container text-nowrap text-xs sm:text-sm md:text-base ${
                location.pathname.includes("submitted")
                    ? "px-2 sm:px-10 w-full"
                    : "w-11/12"
            } mt-8 text-gray-600`}
        >
            <ol className="flex flex-wrap items-center space-x-2">
                {pathSegments.map((segment, index) => {
                    const path = `/${pathSegments
                        .slice(0, index + 1)
                        .join("/")}`;
                    const isLast = index === pathSegments.length - 1;

                    // Don't show the first segment if it's the only one
                    if (index === 0 && pathSegments.length === 1) {
                        return null;
                    }

                    // Check if we are after "barangays" or "submitted" in the path
                    const isAfterBarangays =
                        barangaysIndex > -1 && index > barangaysIndex;
                    const isAfterSubmitted =
                        submittedIndex > -1 && index >= submittedIndex;
                    const isAfterEdit = editIndex > -1 && index >= editIndex;

                    return (
                        <li key={path} className="flex items-center capitalize">
                            {/* Show chevron for items after the first */}
                            {index > 0 && (
                                <FontAwesomeIcon
                                    icon={faChevronRight}
                                    className={`mr-2 ${
                                        isAfterBarangays ||
                                        isAfterSubmitted ||
                                        isAfterEdit
                                            ? "text-gray-400"
                                            : "text-green"
                                    }`}
                                />
                            )}

                            {isAfterBarangays ||
                            isAfterSubmitted ||
                            isAfterEdit ? (
                                // Disabled breadcrumb for "barangays" or "submitted" and after them
                                <span className="text-gray-400 cursor-not-allowed">
                                    {getLabel(segment)}
                                </span>
                            ) : isLast ? (
                                // Last item in breadcrumb
                                <span className="text-gray-500">
                                    {getLabel(segment)}
                                </span>
                            ) : (
                                // Normal link for non-disabled breadcrumbs
                                <Link
                                    to={path}
                                    className="font-bold text-green hover:underline"
                                >
                                    {getLabel(segment)}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
