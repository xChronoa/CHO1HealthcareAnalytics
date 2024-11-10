import { useState, useCallback, useEffect } from "react";
import { baseAPIUrl } from "../../config/apiConfig";
import cho_logo from "../../assets/images/cho_logo.png";
import cabuyao_logo from "../../assets/images/cabuyao_logo.png";
import { useAuth } from "../../context/AuthContext";
import React from "react";
import { useLoading } from "../../context/LoadingContext";

// Interfaces for data structure
interface AgeGroup {
    M: number;
    F: number;
}

interface Disease {
    disease_name: string;
    ageGroup: AgeGroup[];
}

interface MorbidityReport {
    data: Disease[];
    report_id: number;
    report_period: string;
    report_status: string;
}

interface SubmittedM2Props {
    barangayId: number | null,
    barangayName: string | null,
    selectedMonth: string;
    selectedYear: string;
}

const SubmittedM2: React.FC<SubmittedM2Props> = ({
    barangayId,
    barangayName,
    selectedMonth,
    selectedYear,
}) => {
    const [reports, setReports] = useState<any>(null);
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchMorbidityReports = useCallback(
        async (selectedMonth: string, selectedYear: string) => {
            try {
                incrementLoading();
                setError(null);

                // Fetch reports
                const response = await fetch(
                    `${baseAPIUrl}/morbidity-reports/filtered`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                            barangay_id: barangayId,
                            report_month: selectedMonth,
                            report_year: selectedYear,
                        }),
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch reports.");

                const data: MorbidityReport[] = await response.json();
                setReports(data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        },
        []
    );

    useEffect(() => {
        if (selectedMonth && selectedYear) {
            fetchMorbidityReports(selectedMonth, selectedYear);
        }
    }, [fetchMorbidityReports, selectedMonth, selectedYear]);

    const ageGroups = [
        "0-6 days",
        "7-28 days",
        "29d-11mos",
        "1-4",
        "5-9",
        "10-14",
        "15-19",
        "20-24",
        "25-29",
        "30-34",
        "35-39",
        "40-44",
        "45-49",
        "50-54",
        "55-59",
        "60-64",
        "65-69",
        "70+",
        "Total",
    ];

    const createTableRow = (
        diseaseName: string,
        diseaseCode: string,
        diseaseData: any,
        rowIndex: number
    ) => {
        const isEvenRow = rowIndex % 2 === 0;
        const rowStyle = isEvenRow
            ? { backgroundColor: "#ffffff" }
            : { backgroundColor: "lightgray" };

        const rowCells = [
            <td
                key={`${diseaseName}-name`}
                className="px-2 uppercase border border-black disease-name"
            >
                {diseaseName}
            </td>,
            <td
                key={`${diseaseName}-code`}
                className="px-2 border border-black"
            >
                {diseaseCode}
            </td>,
        ];

        // Populate age group cells
        ageGroups.forEach((ageGroup) => {
            rowCells.push(
                <td
                    key={`${diseaseName}-${ageGroup}-M`}
                    className="px-2 text-[.6rem] font-bold border border-black"
                    style={{ borderRight: "2px dashed black" }}
                >
                    {diseaseData[ageGroup]?.M || 0}
                </td>
            );
            rowCells.push(
                <td
                    key={`${diseaseName}-${ageGroup}-F`}
                    className="px-2 text-[.6rem] font-bold border border-black"
                >
                    {diseaseData[ageGroup]?.F || 0}
                </td>
            );
        });

        return (
            <tr key={diseaseName} style={rowStyle}>
                {rowCells}
            </tr>
        );
    };

    const handlePrint = () => {
        const printContent = document.getElementById("printableTable");

        // Check if the barangayName is defined before proceeding
        if (!barangayName && user) {
            barangayName = user.barangay_name; // Fallback to user value
        }
    
        // Create a new window for printing
        const windowPrint = window.open("", "_blank");
    
        // Check if the window was opened successfully
        if (windowPrint) {
            // Write the HTML for the print layout
            windowPrint.document.write(`
                <html>
                    <head>
                        <title>Barangay ${barangayName !== null ? barangayName : user ? user?.barangay_name : ""} - Morbidity Report - ${new Date(0, Number(selectedMonth) - 1).toLocaleString("default", { month: "long" })} ${selectedYear}</title>
                        <style>
                            *{-webkit-print-color-adjust:exact;color-adjust:exact;print-color-adjust:exact}*,body{margin:0;padding:0}@page{size:11in 8.5in}body{font-family:Arial,sans-serif;visibility:hidden;background-color:gray}td,th{border:1px solid #000;text-align:center;padding:6px}@media print{table,thead th{font-size:10px}body,table{visibility:visible}.bg-white,body{background-color:#fff}@page{size:landscape}table{width:100%;border-collapse:collapse}thead th{text-wrap:nowrap}tbody td{font-size:11px}.px-2{padding-left:.5rem;padding-right:.5rem}tr{page-break-inside:avoid}.flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}.underline{text-decoration:underline}.uppercase{text-transform:uppercase}.size-14{width:5rem;height:5rem}.font-bold{font-weight:700}.italic{font-style:italic}.text-gray-500{color:#6b7280}.text-lg{font-size:1.125rem}.text-5xl{font-size:3rem}.text-2xl{font-size:1.5rem}.size-16{width:64px;height:64px}.min-w-200{min-width:200px}.text-left{text-align:left}.gap-2{gap:.5rem}}
                        </style>
                    </head>
                    <body>
                        ${printContent?.outerHTML}
                    </body>
                </html>
            `);
    
            // Close the document and focus on the new window
            windowPrint.document.close();
            windowPrint.focus();
    
            // Delay printing to allow the content to render
            setTimeout(() => {
                windowPrint.print();
                windowPrint.close(); // Close the print window after printing
            }, 100); // Adjust timeout if necessary
        }
    };

    return (
        <>
            {error ? (
                <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                    <h1 className="font-bold text-center text-red-500">
                        Error: {error}
                    </h1>
                </div>
            ) : (
                reports !== null ? (
                    <>
                        <button
                            onClick={handlePrint}
                            className="transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-[1.9rem] py-2.5 text-center"
                        >
                            Download M2 Report
                        </button>
                        <div id="printableTable" className="flex flex-col w-full gap-6 py-12 overflow-x-auto border-2 border-black rounded-lg 2xl:items-center 2xl:justify-center">
                            <table className="border-collapse text-[9px] bg-white text-center table-fixed">
                                <thead>
                                    <tr>
                                        <th className="px-2 border border-black">
                                            <div className="flex items-center justify-center gap-2 lg:gap-0">
                                                <img
                                                    src={cho_logo}
                                                    alt="CHO Logo"
                                                    className="size-14 lg:scale-90"
                                                    loading="lazy"
                                                />
                                                <img
                                                    src={cabuyao_logo}
                                                    alt="Cabuyao Logo"
                                                    className="size-14 lg:scale-90"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </th>
                                        <td colSpan={35} className="border border-black">
                                            <section className="flex flex-col items-center justify-center gap-2">
                                                <div className="flex flex-col gap-2 text-xs text-left">
                                                    <p>
                                                        FHIS REPORT for MONTH:{" "}
                                                        <span className="font-bold underline uppercase">
                                                            {new Date(
                                                                0,
                                                                Number(selectedMonth) - 1
                                                            ).toLocaleString("default", {
                                                                month: "long",
                                                            })}{" "}
                                                        </span>
                                                        YEAR:{" "}  
                                                        <span className="font-bold underline">
                                                            {selectedYear}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Barangay:{" "}
                                                        <span className="font-bold underline uppercase">
                                                            {barangayName !== null ? barangayName : user ? user?.barangay_name : ""}
                                                        </span>
                                                        , City of Cabuyao
                                                    </p>
                                                    <p>
                                                        Province:{" "}
                                                        <span className="font-bold underline uppercase">
                                                            Laguna
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <h1 className="text-lg font-bold uppercase">
                                                        Morbidity Disease Report
                                                    </h1>
                                                    <p className="italic text-gray-500">
                                                        For submission to PHO
                                                    </p>
                                                </div>
                                            </section>
                                        </td>
                                        <th
                                            colSpan={4}
                                            className="text-center border border-black"
                                        >
                                            <p className="text-[.5rem] italic">
                                                FHSIS v.2012
                                            </p>
                                            <h1 className="text-5xl font-extrabold">M2</h1>
                                            <h1 className="text-2xl font-extrabold">RHU</h1>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th
                                            className="font-extrabold uppercase border border-black text-md min-w-200"
                                            rowSpan={2}
                                        >
                                            Disease
                                        </th>
                                        <th
                                            className="font-extrabold uppercase border border-black"
                                            rowSpan={2}
                                        >
                                            ICD 10 Code
                                        </th>
                                        {ageGroups.map((ageGroup, index) => {
                                            // Determine the status of the current age group
                                            const isSeventyPlus = ageGroup === "70+";
                                            const isTotal = ageGroup === "Total";
                                            const isSpecialAgeGroup = [0, 1, 2].includes(
                                                index
                                            );

                                            // Define styles based on conditions
                                            const thStyle: React.CSSProperties = {
                                                ...(isSeventyPlus && {
                                                    backgroundColor: "lightgray",
                                                }),
                                                ...(isSpecialAgeGroup && {
                                                    backgroundColor: "yellow",
                                                }),
                                            };

                                            // Use a CSS class to apply text transformation for the total row
                                            const className = isTotal ? "uppercase" : "";

                                            return (
                                                <th
                                                    key={ageGroup}
                                                    className={`border border-black ${className}`}
                                                    colSpan={2}
                                                    style={thStyle}
                                                >
                                                    {ageGroup}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                    <tr>
                                        {ageGroups.map((ageGroup) => (
                                            <React.Fragment key={ageGroup}>
                                                <th
                                                    key={`${ageGroup}-M`}
                                                    className="border border-black"
                                                    style={{
                                                        borderRight: "2px dashed black",
                                                    }}
                                                >
                                                    M
                                                </th>
                                                <th
                                                    key={`${ageGroup}-F`}
                                                    className="border border-black"
                                                >
                                                    F
                                                </th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports &&
                                        Object.keys(reports.data.data).map(
                                            (disease, index) => {
                                                const diseaseData =
                                                    reports.data.data[disease];
                                                const diseaseCode =
                                                    diseaseData.disease_code;

                                                return createTableRow(
                                                    disease,
                                                    diseaseCode,
                                                    diseaseData,
                                                    index
                                                );
                                            }
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="w-full p-12 mt-4 bg-white rounded-lg border-[1px] border-gray-400 no-submitted-report ">
                        <h1 className="text-center">
                            No submitted reports were found for Barangay {barangayName || user?.barangay_name} {" "}
                            on the month of {" "} {new Date(0, Number(selectedMonth) - 1).toLocaleString(
                                "default", {month: "long",}
                            )} {" "} {selectedYear}
                        </h1>
                    </div>
                )
            )}
            
        </>
    );
};

export default SubmittedM2;
