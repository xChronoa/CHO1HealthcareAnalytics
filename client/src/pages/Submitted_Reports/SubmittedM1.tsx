import cho_logo from "../../assets/images/cho_logo.png";
import React, { useCallback, useEffect, useState } from "react";
import { baseAPIUrl } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";

interface SubmittedM1Props {
    barangayId: number | null,
    barangayName: string | null,
    selectedMonth: string;
    selectedYear: string;
}

interface B1PrenatalCare {
    "B1. Prenatal Care": {
        indicators: {
            indicator_id: number;
            indicator_name: string;
            age_categories: {
                "10-14": { value: number };
                "15-19": { value: number };
                "20-49": { value: number };
            };
            total: number;
            male: number;
            female: number;
            remarks: string;
        }[];
    };
}

interface FPReport {
    report_submission_id: number;
    report_period: string; // Format: "YYYY-MM"
    status: string;
    methods: {
        method_id: number;
        method_name: string;
        age_categories: {
            [ageCategory: string]: {
                current_users_beginning_month: number;
                new_acceptors_prev_month: number;
                other_acceptors_present_month: number;
                drop_outs_present_month: number;
                current_users_end_month: number;
                new_acceptors_present_month: number;
            };
        };
    }[];
    totals: {
        [ageCategory: string]: {
            total_current_users_beginning_month: number;
            total_new_acceptors_prev_month: number;
            total_other_acceptors_present_month: number;
            total_drop_outs_present_month: number;
            total_current_users_end_month: number;
            total_new_acceptors_present_month: number;
        };
    };
}

interface ModernWRAReport {
    report_submission_id: number;
    report_period: string; // Format: "YYYY-MM"
    "10-14": number;
    "15-19": number;
    "20-49": number;
    "15-49": number;
    "total": number;
    status: string;
}


const SubmittedM1: React.FC<SubmittedM1Props> = ({
    barangayId,
    barangayName,
    selectedMonth,
    selectedYear,
}) => {
    const [reports, setReports] = useState<B1PrenatalCare | null>(null);
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchServiceDataReports = useCallback(
        async (selectedMonth: string, selectedYear: string) => {
            try {
                incrementLoading();
                setError(null);

                // Fetch reports
                const response = await fetch(
                    `${baseAPIUrl}/service-data-reports/`,
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
                            service_name: "B1. Prenatal Care",
                        }),
                    }
                );

                if (!response.ok) throw new Error("Failed to fetch reports.");

                const data = await response.json();
                setReports(data.data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        },
        []
    );

    const [fpReports, setFPReports] = useState<FPReport | null>(null);

    const fetchFamilyPlanningReports = useCallback(
        async (selectedMonth: string, selectedYear: string) => {
            try {
                incrementLoading();
                setError(null);

                // Fetch family planning reports
                const response = await fetch(
                    `${baseAPIUrl}/family-planning-reports/filtered`, // Adjust this endpoint accordingly
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

                if (!response.ok) throw new Error("Failed to fetch family planning reports.");

                const data = await response.json();
                setFPReports(data.data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        },
        [] // Add dependencies if necessary
    );

    const [modernWRAReports, setModernWRAReports] = useState<ModernWRAReport | null>(null);

    const fetchModernWRAReports = useCallback(
        async (selectedMonth: string, selectedYear: string) => {
            try {
                incrementLoading();
                setError(null);

                // Fetch modern women of reproductive ages reports
                const response = await fetch(
                    `${baseAPIUrl}/wra-reports/filtered`, // Adjust this endpoint accordingly
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

                if (!response.ok) throw new Error("Failed to fetch modern WRA reports.");

                const data = await response.json();
                setModernWRAReports(data.data);
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
            fetchServiceDataReports(selectedMonth, selectedYear);
            fetchFamilyPlanningReports(selectedMonth, selectedYear);
            fetchModernWRAReports(selectedMonth, selectedYear);
        }
    }, [fetchServiceDataReports, fetchFamilyPlanningReports, fetchModernWRAReports, selectedMonth, selectedYear]);

    const getAgeCategoryValue = (indicatorId: number, ageCategory: keyof B1PrenatalCare["B1. Prenatal Care"]["indicators"][number]["age_categories"]) => {
        if (reports && reports["B1. Prenatal Care"]) {
            const indicator = reports["B1. Prenatal Care"].indicators.find(ind => ind.indicator_id === indicatorId);
            return indicator ? indicator.age_categories[ageCategory].value : 0;
        }
        return 0;
    };

    const getIndicatorTotal = (indicatorId: number) => {
        if (reports && reports["B1. Prenatal Care"]) {
            const indicator = reports["B1. Prenatal Care"].indicators.find(ind => ind.indicator_id === indicatorId);
            return indicator ? indicator.total : 0;
        }
        return 0;
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
                        <title>Barangay ${barangayName !== null ? barangayName : user ? user?.barangay_name : ""} - M1 Report (Page 1) - ${new Date(0, Number(selectedMonth) - 1).toLocaleString("default", { month: "long" })} ${selectedYear}</title>
                        <style>
                            *,body{margin:0;padding:0}@page{size:8.5in 13in;margin:2mm 10mm 2mm 10mm}body{font-family:Arial,sans-serif;visibility:hidden;background-color:gray}td,th{border:1px solid #000;text-align:center}th{background-color:#f2f2f2}@media print{#header,.fp-one{width:100%}.bg-white,body{background-color:#fff}.py-12,.py-2{padding-top:.5rem}@page{size:portrait}body{visibility:visible}table{font-size:8px}.modern-wra p{margin-bottom:4px}#header tbody tr td div h1.text-6xl{font-size:4rem}#header tbody tr td div h1.text-3xl{font-size:2rem}#header tbody tr td div p{font-size:.5rem}#header{table-layout:auto}#printableTable{display:flex;justify-content:center;align-items:center}#header tbody tr td div div{flex-direction:row}.flex{display:flex}.flex-col{flex-direction:column}.gap-6{gap:.55rem}.py-12{padding-bottom:3rem}.overflow-x-auto{overflow-x:auto}.border-collapse{border-collapse:collapse}.text-\[9px\]{font-size:9px}.table-fixed{table-layout:fixed}.text-lg{font-size:.8rem;line-height:1.75rem}.px-2{padding-left:.5rem;padding-right:.5rem}.border-2{border-width:2px}.border-black{--tw-border-opacity:1;border-color:rgb(0 0 0 / var(--tw-border-opacity))}.items-center{align-items:center}.justify-center{justify-content:center}.text-sm{font-size:.6rem;line-height:1.25rem}.gap-4{gap:1rem}.mb-2{margin-bottom:.5rem}.size-16{width:4rem;height:4rem}.text-xs{font-size:.75rem;line-height:1rem}.italic{font-style:italic}.font-bold{font-weight:700}.text-left{text-align:left}.underline{text-decoration-line:underline}.uppercase{text-transform:uppercase}.text-6xl{font-size:3.75rem;line-height:1}.font-extrabold{font-weight:800}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-center{text-align:center}.text-nowrap{text-wrap:nowrap}.px-14{padding-left:3.5rem;padding-right:3.5rem}.font-medium{font-weight:500}.indent-4{text-indent:1rem}.py-2{padding-bottom:.5rem}.bg-black{background-color:#000}.text-white{color:#fff}.w-80{width:20rem}.pl-12{padding-left:3rem}.bg-gray{background-color:#d9d9d9}.bg-pink{background-color:#f9c}}
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
        } else {
            console.error("Failed to open print window.");
        }
    };

    return (
        <>  
            <button
                onClick={handlePrint}
                className="transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
            >
                Download M1 Report
            </button>
            <div id="printableTable" className="flex flex-col w-full gap-6 py-12 overflow-x-auto lg:items-center lg:justify-center 2xl:flex 2xl:items-center 2xl:justify-center">
                    <table
                        id="header"
                        className="border-collapse text-[9px] bg-white text-center table-fixed text-lg"
                    >
                        <tbody>
                            <tr>
                                <td className="px-2 border-2 border-black">
                                    <div className="flex flex-col items-center justify-center text-sm wrap">
                                        <div className="flex flex-col gap-4 mb-2 lg:flex-row divide">
                                            <p>Received by:</p>
                                            <img
                                                src={cho_logo}
                                                className="size-16 min-w-16 md:size-16"
                                                loading="lazy"
                                            />
                                        </div>
                                        <p className="text-xs italic">
                                            Indicate Date & Time
                                        </p>
                                    </div>
                                </td>
                                <td className="px-2 border-2 border-black">
                                    <div className="flex flex-col justify-center text-sm text-left">
                                        <p>
                                            FHSIS Report for the Month & Year: {" "}
                                            <span className="font-bold underline uppercase">
                                                {new Date(
                                                            0,
                                                            Number(selectedMonth) - 1
                                                        ).toLocaleString("default", {
                                                            month: "long",
                                                        })} {" "} {selectedYear}
                                            </span>
                                        </p>
                                        <p>
                                            Name of Barangay: {" "}
                                            <span className="font-bold underline uppercase">
                                                {barangayName !== null ? barangayName : user ? user?.barangay_name : ""}
                                            </span>
                                        </p>
                                        <p>
                                            Name of Municipality/City/Province: {" "}
                                            <span className="font-bold underline uppercase">
                                                City of Cabuyao
                                            </span>
                                        </p>
                                        <p>
                                            Name of BHS: {" "}
                                            <span className="font-bold underline uppercase">
                                                {barangayName !== null ? barangayName : user ? user?.barangay_name : ""} {" "} Health Station
                                            </span>
                                        </p>
                                        <p>Projected Population of the Year:</p>
                                    </div>
                                </td>
                                <td className="px-2 border-2 border-black">
                                    <div>
                                        <h1 className="text-6xl font-extrabold">
                                            M1
                                        </h1>
                                        <h1 className="text-3xl font-extrabold">
                                            BRGY
                                        </h1>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="modern-wra">
                        <p className="text-xs font-bold text-center">
                            Section A. Family Planning Services and Deworming for
                            Women of Reproductive Age
                        </p>
                        <table
                            id="modern-wra"
                            className="border-collapse text-[9px] bg-white text-center table-fixed text-xs"
                        >
                            <thead>
                                <tr>
                                    <th
                                        rowSpan={2}
                                        className="border-2 border-black w-80"
                                    >
                                        A1. Modern FP Unmet Need
                                    </th>
                                    <th
                                        colSpan={3}
                                        className="px-2 border-2 border-black"
                                    >
                                        Age
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        Total for WRA
                                    </th>
                                </tr>
                                <tr>
                                    <th className="px-2 border-2 border-black text-nowrap">
                                        10 - 14 yo
                                    </th>
                                    <th className="px-2 border-2 border-black text-nowrap">
                                        15 - 19 yo
                                    </th>
                                    <th className="px-2 border-2 border-black text-nowrap">
                                        20 - 49 yo
                                    </th>
                                    <th className="px-2 border-2 border-black text-nowrap">
                                        15 - 49 yo
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-left border-2 border-black">
                                        1. No. of WRA with unmet need for modern FP
                                    </td>

                                    <td className="px-2 border-2 border-black">{modernWRAReports?.["10-14"] || 0}</td>
                                    <td className="px-2 border-2 border-black">{modernWRAReports?.["15-19"]}</td>
                                    <td className="px-2 border-2 border-black">{modernWRAReports?.["20-49"]}</td>
                                    <td className="px-2 border-2 border-black">{modernWRAReports?.["15-49"]}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Family Planning One */}
                    <div className="flex flex-row fp-one">
                        <table
                            id="family-planning one"
                            className="border-black border-collapse text-[9px] bg-white text-center table-fixed"
                        >
                            <thead>
                                <tr>
                                    <th
                                        colSpan={7}
                                        className="px-14 text-sm bg-[#ff99cc] bg-pink border-2 border-black"
                                    >
                                        User of Family Planning Method for{" "}
                                        <span className="text-lg font-extrabold">
                                            10-14
                                        </span>{" "}
                                        years old
                                    </th>
                                </tr>
                                <tr>
                                    <th
                                        rowSpan={2}
                                        className="px-2 border-2 border-black min-w-40"
                                    >
                                        FP Methods
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        CU
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        NA
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        OA
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        DO
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        CU
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        NA
                                    </th>
                                </tr>
                                <tr>
                                    <th className="px-2 border-2 border-black">
                                        BM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        EM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {fpReports && fpReports.methods.map((method) => {
                                    const ageData = method.age_categories['10-14'] || {};
                                    const isCondom = method.method_name === "c. Condom";
                                    const isImplant = method.method_name === "f. Implant";
                                    const methodClass = `px-2 text-left font-medium bg-[#d9d9d9] bg-gray border-2 border-black ${["d.1 Pills-POP", "d.2 Pills-COC", "g.1 IUD-I", "g.2 IUD-PP"].includes(method.method_name) ? "indent-4" : ""}`;

                                    return (
                                        <React.Fragment key={method.method_id}>
                                            <tr>
                                                <td className={methodClass}>
                                                    {method.method_name}
                                                </td>
                                                <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                    {ageData.current_users_beginning_month || 0}
                                                </td>
                                                <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                    {ageData.new_acceptors_prev_month || 0}
                                                </td>
                                                <td className="px-2 font-medium border-2 border-black">
                                                    {ageData.other_acceptors_present_month || 0}
                                                </td>
                                                <td className="px-2 font-medium border-2 border-black">
                                                    {ageData.drop_outs_present_month || 0}
                                                </td>
                                                <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                    {ageData.current_users_end_month || 0}
                                                </td>
                                                <td className="px-2 font-medium border-2 border-black">
                                                    {ageData.new_acceptors_present_month || 0}
                                                </td>
                                            </tr>
                                            {(isCondom || isImplant) && (
                                                <tr>
                                                    <td colSpan={7} className="px-2 font-medium text-left text-white bg-black border-2 border-black">
                                                        {isCondom ? "d. Pills" : "g. IUD (IUD-I and IUD-PP)"}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {fpReports && 
                                    <tr>
                                        <td className="px-2 text-left font-medium bg-[#d9d9d9] bg-gray border-2 border-black">
                                            m. Total Current Users
                                        </td>
                                        <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                            {fpReports.totals["15-19"].total_current_users_beginning_month || 0}
                                        </td>
                                        <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                            {fpReports.totals["15-19"].total_new_acceptors_prev_month || 0}
                                        </td>
                                        <td className="px-2 font-medium border-2 border-black">
                                            {fpReports.totals["15-19"].total_other_acceptors_present_month || 0}
                                        </td>
                                        <td className="px-2 font-medium border-2 border-black">
                                            {fpReports.totals["15-19"].total_drop_outs_present_month || 0}
                                        </td>
                                        <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                            {fpReports.totals["15-19"].total_current_users_end_month || 0}
                                        </td>
                                        <td className="px-2 font-medium border-2 border-black">
                                            {fpReports.totals["15-19"].total_new_acceptors_present_month || 0}
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                        <table
                            id="family-planning one"
                            className="border-collapse text-[9px] bg-white text-center table-fixed"
                        >
                            <thead>
                                <tr>
                                    <th
                                        colSpan={7}
                                        className="px-14 text-sm bg-[#ff99cc] bg-pink border-2 border-black"
                                    >
                                        User of Family Planning Method for{" "}
                                        <span className="text-lg font-extrabold">
                                            15-19
                                        </span>{" "}
                                        years old
                                    </th>
                                </tr>
                                <tr>
                                    <th
                                        rowSpan={2}
                                        className="px-2 border-2 border-black min-w-40"
                                    >
                                        FP Methods
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        CU
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        NA
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        OA
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        DO
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        CU
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        NA
                                    </th>
                                </tr>
                                <tr>
                                    <th className="px-2 border-2 border-black">
                                        BM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        EM
                                    </th>
                                    <th className="px-2 border-2 border-black">
                                        PM
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {fpReports && fpReports.methods.map((method) => {
                                    const ageData = method.age_categories['15-19'] || {};
                                    const isCondom = method.method_name === "c. Condom";
                                    const isImplant = method.method_name === "f. Implant";
                                    const methodClass = `px-2 text-left font-medium bg-[#d9d9d9] bg-gray border-2 border-black ${["d.1 Pills-POP", "d.2 Pills-COC", "g.1 IUD-I", "g.2 IUD-PP"].includes(method.method_name) ? "indent-4" : ""}`;

                                    return (
                                        <React.Fragment key={method.method_id}>
                                            <tr>
                                                <td className={methodClass}>
                                                    {method.method_name}
                                                </td>
                                                <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                    {ageData.current_users_beginning_month || 0}
                                                </td>
                                                <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                    {ageData.new_acceptors_prev_month || 0}
                                                </td>
                                                <td className="px-2 font-medium border-2 border-black">
                                                    {ageData.other_acceptors_present_month || 0}
                                                </td>
                                                <td className="px-2 font-medium border-2 border-black">
                                                    {ageData.drop_outs_present_month || 0}
                                                </td>
                                                <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                    {ageData.current_users_end_month || 0}
                                                </td>
                                                <td className="px-2 font-medium border-2 border-black">
                                                    {ageData.new_acceptors_present_month || 0}
                                                </td>
                                            </tr>
                                            {(isCondom || isImplant) && (
                                                <tr>
                                                    <td colSpan={7} className="px-2 font-medium text-left text-white bg-black border-2 border-black">
                                                        {isCondom ? "d. Pills" : "g. IUD (IUD-I and IUD-PP)"}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {fpReports && 
                                    <tr>
                                        <td className="px-2 text-left font-medium bg-[#d9d9d9] bg-gray border-2 border-black">
                                            m. Total Current Users
                                        </td>
                                        <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                            {fpReports.totals["10-14"].total_current_users_beginning_month || 0}
                                        </td>
                                        <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                            {fpReports.totals["10-14"].total_new_acceptors_prev_month || 0}
                                        </td>
                                        <td className="px-2 font-medium border-2 border-black">
                                            {fpReports.totals["10-14"].total_other_acceptors_present_month || 0}
                                        </td>
                                        <td className="px-2 font-medium border-2 border-black">
                                            {fpReports.totals["10-14"].total_drop_outs_present_month || 0}
                                        </td>
                                        <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                            {fpReports.totals["10-14"].total_current_users_end_month || 0}
                                        </td>
                                        <td className="px-2 font-medium border-2 border-black">
                                            {fpReports.totals["10-14"].total_new_acceptors_present_month || 0}
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* Family Planning Two */}
                    <table
                        id="family-planning two"
                        className="border-collapse text-[9px] bg-white text-center table-fixed"
                    >
                        <thead>
                            <tr>
                                <th
                                    colSpan={7}
                                    className="px-14 text-sm bg-[#ff99cc] bg-pink border-2 border-black"
                                >
                                    User of Family Planning Method for{" "}
                                    <span className="text-lg font-extrabold">
                                        20-49
                                    </span>{" "}
                                    years old
                                </th>
                            </tr>
                            <tr>
                                <th className="px-2 border-2 border-black min-w-40">
                                    Family Planning Methods
                                </th>
                                <th className="px-2 border-2 border-black">
                                    Current Users <br />{" "}
                                    <span className="font-normal">
                                        (Beginning Month)
                                    </span>
                                </th>
                                <th className="px-2 border-2 border-black">
                                    New Acceptors <br />{" "}
                                    <span className="font-normal">
                                        (Previous Month)
                                    </span>
                                </th>
                                <th className="px-2 border-2 border-black">
                                    Other Acceptors <br />{" "}
                                    <span className="font-normal">
                                        (Present Month)
                                    </span>
                                </th>
                                <th className="px-2 border-2 border-black">
                                    Drop-Outs <br />{" "}
                                    <span className="font-normal">
                                        (Present Month)
                                    </span>
                                </th>
                                <th className="px-2 border-2 border-black">
                                    Current Users <br />{" "}
                                    <span className="font-normal">(End Month)</span>
                                </th>
                                <th className="px-2 border-2 border-black">
                                    New Acceptors <br />{" "}
                                    <span className="font-normal">
                                        (Present Month)
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {fpReports && fpReports.methods.map((method) => {
                                const ageData = method.age_categories['20-49'] || {};
                                const isCondom = method.method_name === "c. Condom";
                                const isImplant = method.method_name === "f. Implant";
                                const methodClass = `px-2 text-left font-medium border-2 border-black ${["d.1 Pills-POP", "d.2 Pills-COC", "g.1 IUD-I", "g.2 IUD-PP"].includes(method.method_name) ? "indent-4" : ""}`;

                                return (
                                    <React.Fragment key={method.method_id}>
                                        <tr>
                                            <td className={methodClass}>
                                                {method.method_name}
                                            </td>
                                            <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                {ageData.current_users_beginning_month || 0}
                                            </td>
                                            <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                {ageData.new_acceptors_prev_month || 0}
                                            </td>
                                            <td className="px-2 font-medium border-2 border-black">
                                                {ageData.other_acceptors_present_month || 0}
                                            </td>
                                            <td className="px-2 font-medium border-2 border-black">
                                                {ageData.drop_outs_present_month || 0}
                                            </td>
                                            <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                                {ageData.current_users_end_month || 0}
                                            </td>
                                            <td className="px-2 font-medium border-2 border-black">
                                                {ageData.new_acceptors_present_month || 0}
                                            </td>
                                        </tr>
                                        {(isCondom || isImplant) && (
                                            <tr>
                                                <td colSpan={7} className="px-2 font-medium text-left text-white bg-black border-2 border-black">
                                                    {isCondom ? "d. Pills" : "g. IUD (IUD-I and IUD-PP)"}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {fpReports && 
                                <tr>
                                    <td className="px-2 font-medium text-left border-2 border-black">
                                        m. Total Current Users
                                    </td>
                                    <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                        {fpReports.totals["20-49"].total_current_users_beginning_month || 0}
                                    </td>
                                    <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                        {fpReports.totals["20-49"].total_new_acceptors_prev_month || 0}
                                    </td>
                                    <td className="px-2 font-medium border-2 border-black">
                                        {fpReports.totals["20-49"].total_other_acceptors_present_month || 0}
                                    </td>
                                    <td className="px-2 font-medium border-2 border-black">
                                        {fpReports.totals["20-49"].total_drop_outs_present_month || 0}
                                    </td>
                                    <td className="px-2 border-2 font-medium border-black bg-[#ff99cc] bg-pink">
                                        {fpReports.totals["20-49"].total_current_users_end_month || 0}
                                    </td>
                                    <td className="px-2 font-medium border-2 border-black">
                                        {fpReports.totals["20-49"].total_new_acceptors_present_month || 0}
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>

                    {/* Section B. Maternal Services */}
                    <table
                        id="maternal-services"
                        className="border-collapse text-[9px] bg-white text-center table-fixed"
                    >
                        <thead>
                            <tr>
                                <th
                                    colSpan={10}
                                    className="px-2 py-2 text-sm border-2 border-black"
                                >
                                    Section B. Maternal Care and Services
                                </th>
                            </tr>
                            <tr className="text-xs">
                                {/* Left Side */}
                                <th
                                    rowSpan={2}
                                    className="px-2 border-2 border-black"
                                >
                                    Indicators
                                </th>
                                <th
                                    colSpan={3}
                                    className="px-2 border-2 border-black"
                                >
                                    Age
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-2 border-2 border-black"
                                >
                                    Total
                                </th>
                                {/* Right Side */}
                                <th
                                    rowSpan={2}
                                    className="px-2 border-2 border-black"
                                >
                                    Indicators
                                </th>
                                <th
                                    colSpan={3}
                                    className="px-2 border-2 border-black"
                                >
                                    Age
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-2 border-2 border-black"
                                >
                                    Total
                                </th>
                            </tr>
                            <tr>
                                {/* Left Side */}
                                <th className="px-2 border-2 border-black">
                                    10-14
                                </th>
                                <th className="px-2 border-2 border-black">
                                    15-19
                                </th>
                                <th className="px-2 border-2 border-black">
                                    20-49
                                </th>
                                {/* Right Side */}
                                <th className="px-2 border-2 border-black">
                                    10-14
                                </th>
                                <th className="px-2 border-2 border-black">
                                    15-19
                                </th>
                                <th className="px-2 border-2 border-black">
                                    20-49
                                </th>
                            </tr>
                            <tr>
                                <th
                                    colSpan={10}
                                    className="px-2 bg-[#d9d9d9] bg-gray text-xs border-2 border-black"
                                >
                                    B1. Prenatal Care
                                </th>
                            </tr>
                        </thead>
                        <tbody className="font-medium text-center">
                            <tr>
                                <td className="px-2 text-left border-2 border-black">
                                    1. No. of pregnant women <br /> with at least 4
                                    prenatal check-ups
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(1, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(1, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(1, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(1)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    8. No. of pregnant women given <br />{" "}
                                    <span className="pl-12">
                                        one dose of deworming tablet
                                    </span>
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(11, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(11, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(11, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(11)}</td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-2 text-left text-white bg-black border-2 border-black"
                                >
                                    2. No. of pregnant women assessed of nutritional
                                    status during the 1st tri
                                </td>
                                <td className="px-2 text-left border-2 border-black">
                                    9. No. of pregnant women <br />{" "}
                                    <span className="pl-12">
                                        screened for syphilis
                                    </span>
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(12, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(12, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(12, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(12)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 pl-3 border-2 border-black">
                                    a. No. of pregnant women seen in the{" "}
                                    <br />
                                    first trimester who have normal BMI
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(3, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(3, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(3, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(3)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    10. No. of pregnant women <br />{" "}
                                    <span className="pl-12">
                                        tested positive for syphilis
                                    </span>
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(13, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(13, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(13, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(13)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 pl-3 border-2 border-black">
                                    b. No. of pregnant women seen in the{" "}
                                    <br />
                                    first trimester who have low BMI
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(4, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(4, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(4, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(4)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    11. No. of pregnant women <br />{" "}
                                    <span className="pl-12">
                                        screened for Hepatitis B
                                    </span>
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(14, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(14, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(14, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(14)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 pl-3 border-2 border-black">
                                    c. No. of pregnant women seen in the{" "}
                                    <br />
                                    first trimester who have high BMI
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(5, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(5, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(5, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(5)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    12. No. of pregnant women
                                    <br />{" "}
                                    <span className="pl-12">
                                        tested positive for Hepatitis B
                                    </span>
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(15, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(15, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(15, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(15)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 text-left border-2 border-black">
                                    3. No. of pregnant women for the 1st time <br />{" "}
                                    given at least 2 doses of Td vaccination
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(6, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(6, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(6, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(6)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    13. No. of pregnant women <br />{" "}
                                    <span className="pl-12"> screened for HIV</span>
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(16, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(16, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(16, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(16)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 text-left border-2 border-black">
                                    4. No. of pregnant women for the 2nd or <br />{" "}
                                    more given at least 3 doses of Td vacc.
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(7, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(7, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(7, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(7)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    14. No. of pregnant women <br /> tested for CBC
                                    or Hgb & Hct count
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(17, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(17, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(17, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(17)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 text-left border-2 border-black">
                                    5. No. of prgenant women who completed <br />{" "}
                                    the dose of Iron w/ folic acid supplementation
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(8, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(8, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(8, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(8)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    15. No. of pregnant women tested for CBC <br />{" "}
                                    or Hgb & Hct count diagnose w/ anemia
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(18, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(18, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(18, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(18)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 text-left border-2 border-black">
                                    6. No. of pregnant women who completed <br />{" "}
                                    doses of calcium carbonate supplementation
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(9, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(9, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(9, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(9)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    16. No. of pregnant women <br /> screened for
                                    gestational diabetes
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(19, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(19, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(19, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(19)}</td>
                            </tr>
                            <tr>
                                <td className="px-2 text-left border-2 border-black">
                                    7. No. of pregnant women given <br /> iodine
                                    capsule
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(10, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(10, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(10, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(10)}</td>
                                <td className="px-2 text-left border-2 border-black">
                                    17. No. of pregnant women <br /> tested positive
                                    for gestational diabetes
                                </td>
                                <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue(20, "10-14")}</td>
                                <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue(20, "15-19")}</td>
                                <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue(20, "20-49")}</td>
                                <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal(20)}</td>
                            </tr>
                        </tbody>
                    </table>
            </div>
        </>
    );
};

export default SubmittedM1;
