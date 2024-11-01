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

interface AgeCategory {
    value: number;
}

interface Indicator {
    indicator_id: number;
    indicator_name: string;
    age_categories: {
        [key: string]: AgeCategory;
    };
    total: number;
    male: number;
    female: number;
    remarks: string;
}

interface Service {
    indicators: Indicator[];
}

interface Reports {
    [serviceName: string]: Service; // Dynamic service name
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
    const [reports, setReports] = useState<Reports | null>(null);
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

    // Function to get the age category value for a dynamic service name
    const getAgeCategoryValue = (
        serviceName: string, // Dynamic service name
        indicatorId: number,
        ageCategory: keyof Reports[typeof serviceName]["indicators"][number]["age_categories"]
    ) => {
        if (reports && reports[serviceName]) {
            const indicator = reports[serviceName].indicators.find(ind => ind.indicator_id === indicatorId);
            return indicator ? indicator.age_categories[ageCategory].value : 0;
        }
        return 0;
    };

    // Function to get the total indicator value for a dynamic service name
    const getIndicatorTotal = (serviceName: string, indicatorId: number) => {
        if (reports && reports[serviceName]) {
            const indicator = reports[serviceName].indicators.find(ind => ind.indicator_id === indicatorId);
            return indicator ? indicator.total : 0;
        }
        return 0;
    };

    // Function to get values of type (total, male, female) for a dynamic service name
    const getValueByType = (
        serviceName: string,
        indicatorId: number,
        valueType: 'total' | 'male' | 'female'
    ) => {
        if (reports && reports[serviceName]) {
            const indicator = reports[serviceName].indicators.find(ind => ind.indicator_id === indicatorId);
            return indicator ? indicator[valueType] : 0;
        }
        return 0;
    };

    // Function to get the age category value for Teenage Pregnancy
    const getTeenagePregnancyAgeCategoryValue = (
        ageCategory: keyof Reports['Teenage Pregnancy']['indicators'][0]['age_categories'] // Accessing the existing structure
    ): number => {
        const serviceName = "Teenage Pregnancy"; // Service name to access
        if (reports && reports[serviceName]) {
            const indicator = reports[serviceName].indicators[0]; // Assuming you want the first indicator
            // Safely access the specific age category value
            return indicator.age_categories[ageCategory]?.value ?? 0; // Return value or 0 if undefined
        }
        return 0; // Return 0 if the service does not exist
    };

    // Function to get the remarks for a dynamic service name
    const getRemarks = (
        serviceName: string,
        indicatorId: number
    ) => {
        if (reports && reports[serviceName]) {
            const indicator = reports[serviceName].indicators.find(ind => ind.indicator_id === indicatorId);
            return indicator ? indicator.remarks : '';
        }
        return '';
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
                        <title>Barangay ${barangayName !== null ? barangayName : user ? user?.barangay_name : ""} - M1 Report - ${new Date(0, Number(selectedMonth) - 1).toLocaleString("default", { month: "long" })} ${selectedYear}</title>
                        <style>
                            *,body{margin:0;padding:0}@page{size:8.5in 13in;margin:2mm 7.5mm 2mm 7.5mm}body{font-family:Arial,sans-serif;visibility:hidden;background-color:gray}td,th{border:1px solid #000;text-align:center}th{background-color:#f2f2f2}@media print{#header,.fp-one{width:100%}.bg-white,body{background-color:#fff}.py-12,.py-2{padding-top:.5rem}@page{size:portrait}body{visibility:visible}table{font-size:8px}.modern-wra p{margin-bottom:4px}#header tbody tr td div h1.text-6xl{font-size:4rem}#header tbody tr td div h1.text-3xl{font-size:2rem}#header tbody tr td div p{font-size:.5rem}#header{table-layout:auto}#printableTable{display:flex;justify-content:center;align-items:center}#header tbody tr td div div{flex-direction:row}.flex{display:flex}.flex-col{flex-direction:column}.gap-6{gap:.55rem}.py-12{padding-bottom:3rem}.overflow-x-auto{overflow-x:auto}.border-collapse{border-collapse:collapse}.text-\[9px\]{font-size:9px}.table-fixed{table-layout:fixed}.text-lg{font-size:.8rem;line-height:1.75rem}.px-2{padding-left:.5rem;padding-right:.5rem}.border-2{border-width:2px}.border-black{--tw-border-opacity:1;border-color:rgb(0 0 0 / var(--tw-border-opacity))}.items-center{align-items:center}.center-this,.justify-center{justify-content:center}.text-sm{font-size:.6rem;line-height:1.25rem}.gap-4{gap:1rem}.mb-2{margin-bottom:.5rem}.size-16{width:4rem;height:4rem}.italic{font-style:italic}.font-bold{font-weight:700}.text-left{text-align:left}.underline{text-decoration-line:underline}.uppercase{text-transform:uppercase}.text-6xl{font-size:3.75rem;line-height:1}.font-extrabold{font-weight:800}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-center{text-align:center}.text-nowrap{text-wrap:nowrap}.px-14{padding-left:3.5rem;padding-right:3.5rem}.font-medium{font-weight:500}.indent-4{text-indent:1rem}.py-2{padding-bottom:.5rem}.bg-black{background-color:#000}.text-white{color:#fff}.w-80{width:20rem}.pl-12{padding-left:3rem}.bg-d9d9d9{background-color:#d9d9d9}.bg-pink{background-color:#f9c}.min-w-44{min-width:8rem}.text-xs{font-size:.5rem;line-height:1rem}.min-w-40{min-width:2rem}.bg-gray{background-color:gray}.indent-sixteen{text-indent:-16px}.pl-5{padding-left:1.25rem}.max-w-24{max-width:7.5rem}.leading-rem{line-height:1.5rem}.border-r-2{border-right:2px solid #000}.flex-1{flex:1 1 0%}.p-0{padding:0}.pl-6{padding-left:1.5rem}}
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
                            className="transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-[1.9rem] py-2.5 text-center "
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
                            <div className="flex flex-row items-center lg:items-center lg:justify-center 2xl:flex 2xl:items-center 2xl:justify-center center-this fp-one">
                                <table
                                    id="family-planning one"
                                    className="border-black border-collapse text-[9px] bg-white text-center table-fixed text-nowrap"
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
                                            const methodClass = `px-2 text-left font-medium bg-[#d9d9d9] bg-d9d9d9 border-2 border-black ${["d.1 Pills-POP", "d.2 Pills-COC", "g.1 IUD-I", "g.2 IUD-PP"].includes(method.method_name) ? "indent-4" : ""}`;

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
                                                <td className="px-2 text-left font-medium bg-[#d9d9d9] bg-d9d9d9 border-2 border-black">
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
                                    className="border-collapse text-[9px] bg-white text-center table-fixed text-nowrap"
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
                                            const methodClass = `px-2 text-left font-medium bg-[#d9d9d9] bg-d9d9d9 border-2 border-black ${["d.1 Pills-POP", "d.2 Pills-COC", "g.1 IUD-I", "g.2 IUD-PP"].includes(method.method_name) ? "indent-4" : ""}`;

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
                                                <td className="px-2 text-left font-medium bg-[#d9d9d9] bg-d9d9d9 border-2 border-black">
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
                                className="border-collapse text-[9px] bg-white text-center table-fixed text-nowrap"
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
                                className="border-collapse text-[9px] bg-white text-center table-fixed text-nowrap"
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
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black"
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
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 1, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 1, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 1, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 1)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            8. No. of pregnant women given <br />{" "}
                                            <span className="pl-12">
                                                one dose of deworming tablet
                                            </span>
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 11, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 11, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 11, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 11)}</td>
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
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 12, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 12, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 12, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 12)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 pl-3 border-2 border-black">
                                            a. No. of pregnant women seen in the{" "}
                                            <br />
                                            first trimester who have normal BMI
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 3, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 3, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 3, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 3)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            10. No. of pregnant women <br />{" "}
                                            <span className="pl-12">
                                                tested positive for syphilis
                                            </span>
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 13, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 13, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 13, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 13)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 pl-3 border-2 border-black">
                                            b. No. of pregnant women seen in the{" "}
                                            <br />
                                            first trimester who have low BMI
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 4, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 4, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 4, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 4)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            11. No. of pregnant women <br />{" "}
                                            <span className="pl-12">
                                                screened for Hepatitis B
                                            </span>
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 14, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 14, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 14, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 14)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 pl-3 border-2 border-black">
                                            c. No. of pregnant women seen in the{" "}
                                            <br />
                                            first trimester who have high BMI
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 5, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 5, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 5, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 5)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            12. No. of pregnant women
                                            <br />{" "}
                                            <span className="pl-12">
                                                tested positive for Hepatitis B
                                            </span>
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 15, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 15, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 15, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 15)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            3. No. of pregnant women for the 1st time <br />{" "}
                                            given at least 2 doses of Td vaccination
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 6, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 6, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 6, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 6)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            13. No. of pregnant women <br />{" "}
                                            <span className="pl-12"> screened for HIV</span>
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 16, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 16, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 16, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 16)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            4. No. of pregnant women for the 2nd or <br />{" "}
                                            more given at least 3 doses of Td vacc.
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 7, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 7, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 7, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 7)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            14. No. of pregnant women <br /> tested for CBC
                                            or Hgb & Hct count
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 17, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 17, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 17, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 17)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            5. No. of prgenant women who completed <br />{" "}
                                            the dose of Iron w/ folic acid supplementation
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 8, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 8, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 8, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 8)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            15. No. of pregnant women tested for CBC <br />{" "}
                                            or Hgb & Hct count diagnose w/ anemia
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 18, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 18, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 18, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 18)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            6. No. of pregnant women who completed <br />{" "}
                                            doses of calcium carbonate supplementation
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 9, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 9, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 9, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 9)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            16. No. of pregnant women <br /> screened for
                                            gestational diabetes
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 19, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 19, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 19, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 19)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            7. No. of pregnant women given <br /> iodine
                                            capsule
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 10, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 10, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 10, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 10)}</td>
                                        <td className="px-2 text-left border-2 border-black">
                                            17. No. of pregnant women <br /> tested positive
                                            for gestational diabetes
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B1. Prenatal Care", 20, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B1. Prenatal Care", 20, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B1. Prenatal Care", 20, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B1. Prenatal Care", 20)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* M1 Back */}
                            <table
                                className="border-collapse text-[9px] bg-white text-center table-fixed"
                            >
                                <thead className="text-nowrap">
                                    <tr className="text-xs">
                                        {/* Left Side */}
                                        <th
                                            rowSpan={2}
                                            className="px-2 text-gray-400 border-2 border-black min-w-44"
                                        >
                                            {barangayName !== null ? barangayName : user ? user?.barangay_name : "Barangay"}
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
                                        <th
                                            rowSpan={2}
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Remarks
                                        </th>
                                        {/* Right Side */}
                                        <th
                                            rowSpan={2}
                                            className="px-2 text-gray-400 border-2 border-black min-w-40"
                                        >
                                            {new Date(0, Number(selectedMonth) - 1).toLocaleString("default", {month: "long",})} {" "} {selectedYear}
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
                                        <th
                                            rowSpan={2}
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Remarks
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
                                </thead>
                                <tbody className="font-medium text-center">
                                    <tr>
                                        <th
                                            colSpan={12}
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                        >
                                            B2. Intrapartum Care and Delivery Outcome
                                        </th>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            18. No. of Deliveries
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 21, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 21, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 21, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 21)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 21)}</td>
                                        <td colSpan={6}
                                            className="px-2 text-left text-white border-2 border-black bg-[gray] bg-gray"
                                        >
                                            24. Pregnancy Outcome
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            19. No. of Livebirths
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 22, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 22, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 22, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 22)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 22)}</td>
                                        <td className="px-2 text-left border-2 border-black indent-4 text-nowrap">
                                            a. No. of full-term births
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 38, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 38, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 38, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 38)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 38)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                            a. Normal Birth Weight
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 23)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 23)}</td>
                                        <td className="px-2 text-left border-2 border-black indent-4 text-nowrap">
                                            b. No. of pre-term births
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 39, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 39, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 39, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 39)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 39)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                            b. Low Birth Weight
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 24)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 24)}</td>
                                        <td className="px-2 text-left border-2 border-black indent-4 text-nowrap">
                                            c. No. of fetal deaths
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 40, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 40, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 40, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 40)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 40)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                            c. Unknown Birth Weight
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 25)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 25)}</td>
                                        <td className="px-2 text-left border-2 border-black indent-4 text-nowrap">
                                            d. No. of abortion/miscarriage
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 41, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 41, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 41, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 41)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 41)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6} className="px-2 text-left border-2 border-black bg-[gray] bg-gray text-white">
                                            20. Number of deliveries attended by Skilled Health Professional
                                        </td>
                                        <th colSpan={6} className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left font-bold">
                                            B3. Postpartum and Newborn Care
                                        </th>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                            a. Atttended by Doctor
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 27)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 27)}</td>
                                        <td rowSpan={4} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-5 indent-[-16px] indent-sixteen">
                                            25. No. of post partum women together with their newborn completed at least 2 postpartum check-ups
                                        </td>
                                        <td rowSpan={4} className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 42, "10-14")}</td>
                                        <td rowSpan={4} className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 42, "15-19")}</td>
                                        <td rowSpan={4} className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 42, "20-49")}</td>
                                        <td rowSpan={4} className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B3. Postpartum and Newborn Care", 42)}</td>
                                        <td rowSpan={4} className="px-2 border-2 border-black" id="remarks">{getRemarks("B3. Postpartum and Newborn Care", 42)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                            b. Attended by Nurse
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 28)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 28)}</td>
                                        
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                        c. Attended by Midwives
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 29)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 29)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6} className="px-2 text-left border-2 border-black bg-[gray] bg-gray text-white">
                                        21. Number of facility-based deliveries
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                            a. Public health facility
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 31)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 31)}</td>
                                        <td rowSpan={3} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-5 indent-[-16px] indent-sixteen">
                                            26. No. of postpartum women who completed iron with folic acid supplementation
                                        </td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 43, "10-14")}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 43, "15-19")}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 43, "20-49")}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B3. Postpartum and Newborn Care", 43)}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="remarks">{getRemarks("B3. Postpartum and Newborn Care", 43)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black indent-4">
                                            b. Private health facility
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="10-14"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 32)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 32)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            22. Number of non-facility based deliveries
                                        </td>
                                        <td className="px-2 bg-black border-2 border-black" id="15-19"></td>
                                        <td className="px-2 bg-black border-2 border-black" id="20-49"></td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 33)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 33)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6} className="px-2 text-left border-2 border-black bg-[gray] bg-gray text-white">
                                        23. Type of Delivery
                                        </td>
                                        <td rowSpan={3} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-5 indent-[-16px] indent-sixteen">
                                            27. No. of postpartum women with Vitamin A supplementation
                                        </td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 44, "10-14")}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 44, "15-19")}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B3. Postpartum and Newborn Care", 44, "20-49")}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B3. Postpartum and Newborn Care", 44)}</td>
                                        <td rowSpan={3} className="px-2 border-2 border-black" id="remarks">{getRemarks("B3. Postpartum and Newborn Care", 44)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                        a. No. of vaginal deliveries
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 35, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 35, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 35, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 35)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 35)}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-2 text-left border-2 border-black">
                                            b. No. of deliveries by C-section
                                        </td>
                                        <td className="px-2 border-2 border-black" id="10-14">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 36, "10-14")}</td>
                                        <td className="px-2 border-2 border-black" id="15-19">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 36, "15-19")}</td>
                                        <td className="px-2 border-2 border-black" id="20-49">{getAgeCategoryValue("B2. Intrapartum Care and Delivery Outcome", 36, "20-49")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getIndicatorTotal("B2. Intrapartum Care and Delivery Outcome", 36)}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("B2. Intrapartum Care and Delivery Outcome", 36)}</td>
                                    </tr>
                                    <tr className="text-xs">
                                        {/* Left Side */}
                                        <th
                                            colSpan={2}
                                            className="px-2 border-2 border-black"
                                        >
                                            Indicators
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Male
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Female
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Total
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Remarks
                                        </th>
                                        {/* Right Side */}
                                        <th
                                            colSpan={2}
                                            className="px-2 border-2 border-black"
                                        >
                                            Indicators
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Male
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Female
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Total
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Remarks
                                        </th>
                                    </tr>

                                    {/* C1 Immunization Services */}
                                    <tr>
                                        <th
                                            colSpan={12}
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                        >
                                            C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents
                                        </th>
                                    </tr>
                                    {(() => {
                                        const base: string = "C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents";
                                        const getValue = (index: number, gender: 'male' | 'female'): number => 
                                            getValueByType(base, index, gender);

                                        const shouldHighlight = (text: string): boolean => {
                                            const highlightedItems = [
                                                "20. Td, Grade 1 (November)",
                                                "21. MR, Grade 1 (November)",
                                                "22. Td, Grade 7 (November)",
                                                "23. MR, Grade 7 (November)",
                                                "Enrolled Grade 1",
                                            ];
                                            return highlightedItems.includes(text);
                                        };

                                        const immunizationPairs = [
                                            { left: { text: "1. CPAB", startIndex: 45 }, 
                                            right: { text: "13. PCV 1", startIndex: 57 } },
                                            { left: { text: "2. BCG", startIndex: 46 }, 
                                            right: { text: "14. PCV 2", startIndex: 58 } },
                                            { left: { text: "3. HepB, within 24 hours", startIndex: 47 }, 
                                            right: { text: "15. PCV 3", startIndex: 59 } },
                                            { left: { text: "4. DPT-HIB-HepB 1", startIndex: 48 }, 
                                            right: { text: "16. MCV 1", startIndex: 60 } },
                                            { left: { text: "5. DPT-HIB-HepB 2", startIndex: 49 }, 
                                            right: { text: "17. MCV 2", startIndex: 61 } },
                                            { left: { text: "6. DPT-HIB-HepB 3", startIndex: 50 }, 
                                            right: { text: "18. FIC", startIndex: 62 } },
                                            { left: { text: "7. OPV 1", startIndex: 51 }, 
                                            right: { text: "19. CIC", startIndex: 63 } },
                                            { left: { text: "8. OPV 2", startIndex: 52 }, 
                                            right: { text: "20. Td, Grade 1 (November)", startIndex: 64 } },
                                            { left: { text: "9. OPV 3", startIndex: 53 }, 
                                            right: { text: "21. MR, Grade 1 (November)", startIndex: 65 } },
                                            { left: { text: "10. IPV 1", startIndex: 54 }, 
                                            right: { text: "22. Td, Grade 7 (November)", startIndex: 66 } },
                                            { left: { text: "11. IPV 2 (Routine)", startIndex: 55 }, 
                                            right: { text: "23. MR, Grade 7 (November)", startIndex: 67 } },
                                            { left: { text: "12. IPV 2 (Catch-Up)", startIndex: 56 }, 
                                            right: { text: "Enrolled Grade 1", startIndex: 68 } }
                                        ];

                                        return immunizationPairs.map(({ left, right }, idx) => (
                                            <tr key={idx}>
                                                <td colSpan={2} className="px-2 text-left border-2 border-black">
                                                    {left.text}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="male">
                                                    {getValue(left.startIndex, 'male')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="female">
                                                    {getValue(left.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="total">
                                                    {getValue(left.startIndex, 'male') + getValue(left.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="remarks">
                                                    {getRemarks(base, left.startIndex)}
                                                </td>
                                                <td colSpan={2} className={`px-2 text-left border-2 border-black ${shouldHighlight(right.text) ? 'bg-[#ff99cc] bg-pink' : ''}`}>
                                                    {right.text}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="male">
                                                    {getValue(right.startIndex, 'male')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="female">
                                                    {getValue(right.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="total">
                                                    {getValue(right.startIndex, 'male') + getValue(right.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="remarks">
                                                    {getRemarks(base, right.startIndex)}
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                    <tr>
                                        <th
                                            colSpan={6}
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                        >
                                            C2. Nutrition Services for Infants and Children
                                        </th>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black bg-[#ff99cc] bg-pink">
                                            Enrolled Grade 7
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents", 69, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents", 69, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents", 69, 'male') + getValueByType("C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents", 69, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("C1. Immunization Services for Newborns, Infants and School-Aged Children/Adolescents", 69)}</td>
                                    </tr>

                                    {/* C2 Nutrition Services */}
                                    <tr>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-5 indent-[-16px] indent-sixteen">
                                            24. Newborns initiated on breastfeeding immediately after birth lasting to 90 mins.
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("C2. Nutrition Services for Infants and Children", 70, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("C2. Nutrition Services for Infants and Children", 70, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("C2. Nutrition Services for Infants and Children", 70, 'male') + getValueByType("C2. Nutrition Services for Infants and Children", 70, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("C2. Nutrition Services for Infants and Children", 70)}</td>

                                        {/* Right */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-5 indent-[-16px] indent-sixteen bg-[#d9d9d9] bg-d9d9d9"></td>
                                        <td className="px-2 border-2 border-black bg-[#d9d9d9] bg-d9d9d9" id="male"></td>
                                        <td className="px-2 border-2 border-black bg-[#d9d9d9] bg-d9d9d9" id="female"></td>
                                        <td className="px-2 border-2 border-black bg-[#d9d9d9] bg-d9d9d9" id="total"></td>
                                        <td className="px-2 border-2 border-black bg-[#d9d9d9] bg-d9d9d9" id="remarks"></td>
                                    </tr>
                                    {(() => {
                                        const base: string = "C2. Nutrition Services for Infants and Children";
                                        const getValue = (index: number, gender: 'male' | 'female'): number => 
                                            getValueByType(base, index, gender);

                                        const nutritionPairs = [
                                            { left: { text: "25. Preterm/LBW infants given iron supplementation", startIndex: 71 },
                                            right: { text: "29. Infants 6-11 mos. given 1 dose of  Vitamin A 100,000 I.U.", startIndex: 75 } },
                                            { left: { text: "26. Infants exclusively breastfed until  5th month and 29th day", startIndex: 72 },
                                            right: { text: "30. Children 12-59 mos. old given 2 doses of Vitamin A 200,000 I.U.", startIndex: 76 } },
                                            { left: { text: "27. Infants 6mos. old initiated to complementary feeding with continued breastfeeding", startIndex: 73 },
                                            right: { text: "31. Infant 6-11 mos. old who completed  MNP supplementation", startIndex: 77 } },
                                            { left: { text: "28. Infants 6mos. old initiated to complementary feeding but no longer or never been breastfed", startIndex: 74 },
                                            right: { text: "32. Children 12-23 mos. who completed  MNP supplementation", startIndex: 78 } }
                                        ];

                                        return nutritionPairs.map(({ left, right }, idx) => (
                                            <tr key={idx}>
                                                <td colSpan={2} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-5 indent-[-16px] indent-sixteen">
                                                    {left.text}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="male">
                                                    {getValue(left.startIndex, 'male')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="female">
                                                    {getValue(left.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="total">
                                                    {getValue(left.startIndex, 'male') + getValue(left.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="remarks">
                                                    {getRemarks(base, left.startIndex)}
                                                </td>
                                                <td colSpan={2} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-5 indent-[-16px] indent-sixteen">
                                                    {right.text}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="male">
                                                    {getValue(right.startIndex, 'male')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="female">
                                                    {getValue(right.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="total">
                                                    {getValue(right.startIndex, 'male') + getValue(right.startIndex, 'female')}
                                                </td>
                                                <td className="px-2 border-2 border-black" id="remarks">
                                                    {getRemarks(base, right.startIndex)}
                                                </td>
                                            </tr>
                                        ));
                                    })()}

                                    <tr className="text-xs">
                                        {/* Left Side */}
                                        <th
                                            colSpan={2}
                                            className="px-2 border-2 border-black"
                                        >
                                            Indicators
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Male
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Female
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Total
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Remarks
                                        </th>
                                        {/* Right Side */}
                                        <th
                                            colSpan={2}
                                            className="px-2 border-2 border-black"
                                        >
                                            Indicators
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Male
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Female
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Total
                                        </th>
                                        <th
                                            className="px-2 border-2 border-black"
                                        >
                                            Remarks
                                        </th>
                                    </tr>

                                    {/* 
                                    * Nutritional Assessment of Children 0-59 mos. Old
                                    * Management of Sick Infants and Children
                                    */}
                                    <tr>
                                        <th
                                            colSpan={6}
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                        >
                                        Nutritional Assessment of Children 0-59 mos. Old
                                        </th>
                                        <th
                                            colSpan={6}
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                        >
                                            Management of Sick Infants and Children
                                        </th>
                                    </tr>
                                    {(() => {
                                        const categories = {
                                            assessment: {
                                                base: "Nutritional Assessment of Children 0-59 mos. Old",
                                                items: [
                                                    { text: "33. Stunted", startIndex: 79 },
                                                    { text: "34. Wasted", startIndex: 80 },
                                                    { text: "a.1 MAM-identified in SFP", startIndex: 81, hasIndent: true },
                                                    { text: "a.2 MAM-admitted in SFP", startIndex: 82, hasIndent: true },
                                                    { text: "a.3 MAM-cured in SFP", startIndex: 83, hasIndent: true },
                                                    { text: "a.4 MAM-died in SFP", startIndex: 84, hasIndent: true },
                                                    { text: "b.1 SAM-identified to OTC", startIndex: 85, hasIndent: true },
                                                    { text: "b.2 SAM-admitted to OTC", startIndex: 86, hasIndent: true },
                                                    { text: "b.3 SAM-cured in OTC", startIndex: 87, hasIndent: true },
                                                    { text: "b.4 SAM-defaulted in OTC", startIndex: 88, hasIndent: true },
                                                    { text: "b.5 SAM-died in OTC", startIndex: 89, hasIndent: true },
                                                    { text: "34. Overweight/Obese", startIndex: 90 },
                                                    { text: "35. Normal", startIndex: 91 },
                                                ]
                                            },
                                            management: {
                                                base: "Management of Sick Infants and Children",
                                                items: [
                                                    { text: "38. Sick infants 6-11 mos. old seen", startIndex: 105 },
                                                    { text: "39. Sick infants 6-11 mos. received Vit. A", startIndex: 106 },
                                                    { text: "40. Sick infants 12-59 mos. old seen", startIndex: 107 },
                                                    { text: "41. Sick infants 12-59 mos. old received Vit. A", startIndex: 108 },
                                                    { text: "42. Diarrhea cases 0-59mos. old seen", startIndex: 109 },
                                                    { text: "43. Diarrhea cases 0-59mos. received ORS", startIndex: 110 },
                                                    { text: "44. Diarrhea cases 0-59 recvd ORS w/ Zinc", startIndex: 111 },
                                                    { text: "45. Pneumonia cases 0-59 mos. old seen", startIndex: 112 },
                                                    { text: "46. Pneumonia cases 0-59 mos. completed Tx", startIndex: 113 },
                                                ]
                                            }
                                        };

                                        // Pair items from both categories
                                        const pairs = Array.from({ length: Math.max(categories.assessment.items.length, categories.management.items.length) }, 
                                            (_, i) => ({
                                                left: categories.assessment.items[i],
                                                right: categories.management.items[i]
                                            }));

                                        return pairs.map(({ left, right }, idx) => (
                                            <tr key={idx}>
                                                {/* Left side */}
                                                {left && (
                                                    <>
                                                        <td colSpan={2} className={`px-2 text-left border-2 border-black ${left.hasIndent ? 'indent-4' : ''}`}>
                                                            {left.text}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="male">
                                                            {getValueByType(categories.assessment.base, left.startIndex, 'male')}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="female">
                                                            {getValueByType(categories.assessment.base, left.startIndex, 'female')}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="total">
                                                            {getValueByType(categories.assessment.base, left.startIndex, 'male') + 
                                                            getValueByType(categories.assessment.base, left.startIndex, 'female')}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="remarks">
                                                            {getRemarks(categories.assessment.base, left.startIndex)}
                                                        </td>

                                                        {left.startIndex === 88 && (
                                                            <>
                                                                <th
                                                                    colSpan={6}
                                                                    className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                                                >
                                                                    Non-Communicable Disease Prevention and Control Services
                                                                </th>
                                                            </>
                                                        )}
                                                        {left.startIndex === 89 && (
                                                            <>
                                                                <th
                                                                    colSpan={2}
                                                                    className="px-2 text-xs border-2 border-black"
                                                                >
                                                                    Indicators
                                                                </th>
                                                                <th
                                                                    className="px-2 text-xs border-2 border-black"
                                                                >
                                                                    Male
                                                                </th>
                                                                <th
                                                                    className="px-2 text-xs border-2 border-black"
                                                                >
                                                                    Female
                                                                </th>
                                                                <th
                                                                    className="px-2 text-xs border-2 border-black"
                                                                >
                                                                    Total
                                                                </th>
                                                                <th
                                                                    className="px-2 text-xs border-2 border-black"
                                                                >
                                                                    Remarks
                                                                </th>
                                                            </>
                                                        )}
                                                        {left.startIndex === 90 && (
                                                            <>
                                                                <td colSpan={2} className="px-2 text-left border-2 border-black">
                                                                1. No. of adults risk-assessed using PhilPEN
                                                                </td>
                                                                <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 114, 'male')}</td>
                                                                <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 114, "female")}</td>
                                                                <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 114, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 114, 'female')}</td>
                                                                <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 114)}</td>
                                                            </>
                                                        )}
                                                        {left.startIndex === 91 && (
                                                            <>
                                                                <td colSpan={2} className="px-2 text-left border-2 border-black">
                                                                2. Current smokers
                                                                </td>
                                                                <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 115, 'male')}</td>
                                                                <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 115, "female")}</td>
                                                                <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 115, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 115, 'female')}</td>
                                                                <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 115)}</td>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {/* Right side */}
                                                {right && (
                                                    <>
                                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                                            {right.text}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="male">
                                                            {getValueByType(categories.management.base, right.startIndex, 'male')}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="female">
                                                            {getValueByType(categories.management.base, right.startIndex, 'female')}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="total">
                                                            {getValueByType(categories.management.base, right.startIndex, 'male') + 
                                                            getValueByType(categories.management.base, right.startIndex, 'female')}
                                                        </td>
                                                        <td className="px-2 border-2 border-black" id="remarks">
                                                            {getRemarks(categories.management.base, right.startIndex)}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ));
                                    })()}

                                    {/* Deworming Services for Infants, Children and Adolescents (Community Based) */}
                                    <tr>
                                        <th
                                            colSpan={6}
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                        >
                                            Deworming Services for Infants, Children and Adolescents (Community Based)
                                        </th>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            3. Alcohol binge drinkers
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 116, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 116, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 116, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 116, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 116)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            37. 1-19 y/o given 2 doses of deworming drug
                                        </td>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Male
                                        </th>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Female
                                        </th>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Total
                                        </th>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Remarks
                                        </th>

                                        {/* Right */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            4. Overweight / Obese
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 117, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 117, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 117, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 117, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 117)}</td>
                                    </tr>
                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black indent-4">
                                            a. PSAC, 1-4 y/o dewormed (2 doses)
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 93, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 93, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 93, 'male') + getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 93, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Deworming Services for Infants, Children and Adolescents (Community Based)", 93)}</td>

                                        {/* Right */}
                                        <td rowSpan={2} colSpan={4} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-6 indent-[-16px] indent-sixteen">
                                            5. No. of adult women screened for Cervical Cancer using <br />VIA/Pap Smear
                                        </td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 118, 'total')}</td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 118)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black indent-4">
                                            b. SAC, 5-9 y/o dewormed (2 doses)
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 94, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 94, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 94, 'male') + getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 94, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Deworming Services for Infants, Children and Adolescents (Community Based)", 94)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black indent-4 text-nowrap">
                                            c. Adolescents, 10-19 y/o dewormed (2 doses)
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 95, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 95, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 95, 'male') + getValueByType("Deworming Services for Infants, Children and Adolescents (Community Based)", 95, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Deworming Services for Infants, Children and Adolescents (Community Based)", 95)}</td>
                                        
                                        {/* Right */}
                                        <td rowSpan={2} colSpan={4} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-6 indent-[-16px] indent-sixteen">
                                            6. No. of adult women found positive/suspect Cervical Cancer <br /> using VIA/Pap Smear
                                        </td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 119, 'total')}</td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 119)}</td>
                                    </tr>

                                    {/* School-Based Deworming Services (Annual Reporting) */}
                                    <tr>
                                        <th
                                            colSpan={6}
                                            className="px-2 text-left text-xs bg-[#ff99cc] bg-pink border-2 border-black"
                                        >
                                            School-Based Deworming Services (Annual Reporting)
                                        </th>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            1-19 y/o given 2 doses of deworming drug
                                        </td>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Male
                                        </th>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Female
                                        </th>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Total
                                        </th>
                                        <th
                                            className="px-2 text-xs border-2 border-black"
                                        >
                                            Remarks
                                        </th>

                                        {/* Right */}
                                        <td rowSpan={2} colSpan={4} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-6 indent-[-16px] indent-sixteen">
                                            7. No. of adult women screened for breast mass
                                        </td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 120, 'total')}</td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 120)}</td>
                                    </tr>
                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black indent-4">
                                            a. PSAC, 1-4 y/o dewormed (2 doses)
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("School-Based Deworming Services (Annual Reporting)", 97, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("School-Based Deworming Services (Annual Reporting)", 97, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("School-Based Deworming Services (Annual Reporting)", 97, 'male') + getValueByType("School-Based Deworming Services (Annual Reporting)", 97, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("School-Based Deworming Services (Annual Reporting)", 97)}</td>
                                    </tr>
                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black indent-4">
                                            b. SAC, 5-9 y/o dewormed (2 doses)
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("School-Based Deworming Services (Annual Reporting)", 98, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("School-Based Deworming Services (Annual Reporting)", 98, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("School-Based Deworming Services (Annual Reporting)", 98, 'male') + getValueByType("School-Based Deworming Services (Annual Reporting)", 98, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("School-Based Deworming Services (Annual Reporting)", 98)}</td>

                                        {/* Right */}
                                        <td rowSpan={2} colSpan={4} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-6 indent-[-16px] indent-sixteen">
                                            8. No. of adult women w/ suspicious breast mass
                                        </td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 121, 'total')}</td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 121)}</td>
                                    </tr>
                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black indent-4 text-nowrap">
                                        c. Adolescents, 10-19 y/o dewormed (2 doses)
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("School-Based Deworming Services (Annual Reporting)", 99, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("School-Based Deworming Services (Annual Reporting)", 99, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("School-Based Deworming Services (Annual Reporting)", 99, 'male') + getValueByType("School-Based Deworming Services (Annual Reporting)", 99, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("School-Based Deworming Services (Annual Reporting)", 99)}</td>
                                    </tr>

                                    {/* Soil Transmitted Helminthiasis Prevention and Control */}
                                    <tr>
                                        <th
                                            colSpan={6}
                                            className="px-2 bg-[#d9d9d9] bg-d9d9d9 text-xs border-2 border-black text-left"
                                        >
                                            Soil Transmitted Helminthiasis Prevention and Control
                                        </th>

                                        {/* Right */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            9. No. of newly-identified hypertensive adults
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 122, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 122, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 122, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 122, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 122)}</td>
                                    </tr>

                                    <tr>
                                        <td rowSpan={2} colSpan={4} className="px-2 text-left border-2 border-black text-wrap max-w-24 pl-6 indent-[-16px] indent-sixteen">
                                            1. No. of WRA, 20-49 years old, who completed 2 doses of deworming tablet
                                        </td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="total">{getValueByType("Soil Transmitted Helminthiasis Prevention and Control", 100, 'total')}</td>
                                        <td rowSpan={2} className="px-2 border-2 border-black" id="remarks">{getRemarks("Soil Transmitted Helminthiasis Prevention and Control", 100)}</td>

                                        {/* Right */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            10. No. of newly-identified adults w/ Type 2 DM
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 123, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 123, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 123, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 123, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 123)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            11. No. of senior ctzns screened for visual acuity
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 124, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 124, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 124, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 124, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 124)}</td>
                                    </tr>
                                    <tr>
                                        <th
                                            colSpan={6}
                                            className="px-2 text-left text-xs bg-[#ff99cc] bg-pink border-2 border-black"
                                        >
                                        </th>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black text-nowrap">
                                            12. No. of senior ctzns diagnosed w/ eye disease/s
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 125, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 125, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 125, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 125, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 125)}</td>
                                    </tr>

                                    {/* E8. Rabies Prevention and Control */}
                                    <tr>
                                        <th
                                            colSpan={6}
                                            className="px-2 text-left text-xs bg-[#d9d9d9] bg-d9d9d9 border-2 border-black"
                                        >
                                            E8. Rabies Prevention and Control
                                        </th>
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            13. No. of SC who recvd (1) dose of PPV
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 126, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 126, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 126, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 126, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 126)}</td>
                                    </tr>

                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            1. No. of animal bites
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("E8. Rabies Prevention and Control", 101, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("E8. Rabies Prevention and Control", 101, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("E8. Rabies Prevention and Control", 101, 'male') + getValueByType("E8. Rabies Prevention and Control", 101, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("E8. Rabies Prevention and Control", 101)}</td>

                                        {/* Right */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            14. No. of SC who recvd (1) dose of flu vaccine
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Non-Communicable Disease Prevention and Control Services", 127, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Non-Communicable Disease Prevention and Control Services", 127, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Non-Communicable Disease Prevention and Control Services", 127, 'male') + getValueByType("Non-Communicable Disease Prevention and Control Services", 127, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Non-Communicable Disease Prevention and Control Services", 127)}</td>
                                    </tr>


                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            2. No. of deaths due to Rabies
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("E8. Rabies Prevention and Control", 102, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("E8. Rabies Prevention and Control", 102, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("E8. Rabies Prevention and Control", 102, 'male') + getValueByType("E8. Rabies Prevention and Control", 102, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("E8. Rabies Prevention and Control", 102)}</td>

                                        {/* Right */}
                                        <th
                                            colSpan={6}
                                            className="px-2 text-center text-xs bg-[#ff99cc] bg-pink border-2 border-black uppercase"
                                        >
                                            Teenage Pregnancy
                                        </th>
                                    </tr>

                                    {/* 
                                    * Part 2. Natality  
                                    * TEENAGE PREGNANCY
                                    */}
                                    <tr>
                                        {/* Left */}
                                        <th
                                            colSpan={6}
                                            className="px-2 text-left text-xs bg-[#d9d9d9] bg-d9d9d9 border-2 border-black"
                                        >
                                            Part 2. Natality
                                        </th>

                                        <td colSpan={6} className="p-0 text-center border-2 border-black">
                                            <div className="flex p-0">
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">20↑</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">19</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">18</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">17</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">16</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">15</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">14</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-r-2 border-black">13</span>
                                                <span className="flex-1 text-xs font-bold leading-normal border-black">12↓</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            Livebirths
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Part 2. Natality", 103, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Part 2. Natality", 103, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Part 2. Natality", 103, 'male') + getValueByType("Part 2. Natality", 103, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Part 2. Natality", 103)}</td>

                                        {/* Right */}
                                        <td rowSpan={2} colSpan={6} className="p-0 text-center border-2 border-black">
                                            <div className="flex p-0">
                                                {[
                                                    "20 and above",
                                                    "19",
                                                    "18",
                                                    "17",
                                                    "16",
                                                    "15",
                                                    "14",
                                                    "13",
                                                    "12 and below"
                                                ].map((ageCategory, index) => (
                                                    <span
                                                        key={ageCategory}
                                                        className={`flex-1 leading-[2.1rem] leading-rem ${index < 8 ? 'border-r-2 border-black' : ''}`}
                                                    >
                                                        {getTeenagePregnancyAgeCategoryValue(ageCategory)}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        {/* Left */}
                                        <td colSpan={2} className="px-2 text-left border-2 border-black">
                                            Livebirths among 15-19 y/o women
                                        </td>
                                        <td className="px-2 border-2 border-black" id="male">{getValueByType("Part 2. Natality", 104, 'male')}</td>
                                        <td className="px-2 border-2 border-black" id="female">{getValueByType("Part 2. Natality", 104, "female")}</td>
                                        <td className="px-2 border-2 border-black" id="total">{getValueByType("Part 2. Natality", 104, 'male') + getValueByType("Part 2. Natality", 104, 'female')}</td>
                                        <td className="px-2 border-2 border-black" id="remarks">{getRemarks("Part 2. Natality", 104)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="w-full p-12 mt-4 bg-white rounded-lg shadow-md no-submitted-report shadow-gray-400">
                        <h1 className="text-center">
                            No submitted reports were found for Barangay {barangayName} {" "}
                            on the month of {" "} {new Date(0, Number(selectedMonth) - 1).toLocaleString(
                                "default", {month: "long",}
                            )} {" "} {selectedYear}
                        </h1>
                    </div>
                )
            )};
        </>
    );
};

export default SubmittedM1;
