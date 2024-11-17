import { faFileLines } from "@fortawesome/free-regular-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

interface PendingReportNoticeProps {
    isOpen: boolean;
    toggleForm: () => void;
}

const PendingReportNotice: React.FC<PendingReportNoticeProps> = ({
    isOpen,
    toggleForm
}) => {
    return (
        <div
            id="crud-modal"
            tabIndex={-1}
            aria-hidden={!isOpen}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <div className="relative w-full max-w-2xl max-h-full p-4">
                <div className="relative bg-white rounded-lg shadow">
                    {/* Modal header */}
                    <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5 bg-[#FFCB3C]">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <FontAwesomeIcon
                                icon={faCircleInfo}
                                className="color-[#ffffff]"
                            />
                            Pending Report
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
                    <div className="flex flex-col items-center gap-4 p-4 md:p-5">
                        <p className="text-justify">
                            This is a reminder that the barangay reports have
                            not yet been submitted. It is crucial that these
                            reports are completed and submitted promptly to
                            ensure that all necessary data is recorded and
                            analyzed in a timely manner. Please prioritize this
                            task to avoid any delays in our operations. Thank
                            you for your cooperation.
                        </p>
                        <Link to="/barangay/report">
                            <button className="bg-green text-white px-8 py-2 rounded-lg flex flex-row gap-2 items-center hover:opacity-70 shadow-lg shadow-gray-400 active:scale-[98%] transition-all">
                                <FontAwesomeIcon icon={faFileLines} className="justify-self-start" />
                                Submit Report
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingReportNotice;
