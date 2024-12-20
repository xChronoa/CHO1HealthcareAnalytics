import React, { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement,
    ChartOptions,
} from "chart.js";
import { useMorbidityReport } from "../../../hooks/useMorbidityReport";
import { faMinimize, faMaximize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLoading } from "../../../context/LoadingContext";
import { useSidebarContext } from "../../../context/SidebarContext";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement
);

interface MorbidityFormChartProps {
    setIsButtonDisabled: (value: boolean) => void;
    chartRef: React.RefObject<HTMLDivElement>;
    textRef: React.RefObject<HTMLHeadingElement>;
    barangay: string;
    year: String | null;
}

const MorbidityFormChart: React.FC<MorbidityFormChartProps> = ({
    setIsButtonDisabled,
    chartRef,
    textRef,
    barangay,
    year,
}) => {
    // State management
    const [selectedOptionMale, setSelectedOptionMale] = useState<string>("All");
    const [selectedOptionFemale, setSelectedOptionFemale] = useState<string>("All");
    const [maximizedCharts, setMaximizedCharts] = useState<{ [key: string]: boolean }>({
        male: true,
        female: true,
    });
    
    // Custom Hooks
    const { error, morbidityReports, fetchMorbidityReports } = useMorbidityReport();
    const { decrementLoading } = useLoading();

    const diseaseColors = useMemo(() => {
        const colors: { [disease: string]: string } = {};
        morbidityReports.forEach((entry) => {
            if (!colors[entry.disease_name]) {
                colors[entry.disease_name] = `#${Math.floor(
                    Math.random() * 16777215
                ).toString(16).padStart(6, '0')}`;
            }
        });
        return colors;
    }, [morbidityReports]);

    const labels = Array.from(
        new Set(morbidityReports.map((entry) => entry.report_period))
    );

    const aggregateDataByDisease = (key: "male" | "female") => {
        const aggregated: { [disease: string]: { [period: string]: number } } = {};

        morbidityReports.forEach((entry) => {
            if (typeof entry[key] === "number") {
                if (!aggregated[entry.disease_name]) {
                    aggregated[entry.disease_name] = {};
                }
                if (!aggregated[entry.disease_name][entry.report_period]) {
                    aggregated[entry.disease_name][entry.report_period] = 0;
                }
                aggregated[entry.disease_name][entry.report_period] += entry[key];
            }
        });

        const datasets = Object.entries(aggregated).map(([disease, periods]) => ({
            label: disease,
            data: labels.map((label) => periods[label] || 0),
            fill: false,
            borderColor: diseaseColors[disease],
            backgroundColor: diseaseColors[disease],
            tension: 0.1,
            gender: key,
            hidden:
                (key === "male" && selectedOptionMale === "Customized"
                    ? visibilityMale[disease] === false || visibilityMale[disease] === undefined
                    : key === "female" && selectedOptionFemale === "Customized"
                    ? visibilityFemale[disease] === false || visibilityFemale[disease] === undefined
                    : false),
        }));

        return datasets;
    };

    const getChartData = (key: "male" | "female") => {
        const selectedOption = key === "male" ? selectedOptionMale : selectedOptionFemale;
        const datasets = aggregateDataByDisease(key);
    
        // If selectedOption is "Customized", filter the datasets based on visibility
        if (selectedOption === "Customized") {
            const visibilityState = key === "male" ? visibilityMale : visibilityFemale;
            const visibleDatasets = datasets.filter(dataset => visibilityState[dataset.label] !== false);
            return {
                labels,
                datasets: visibleDatasets,
            };
        }
    
        // If selectedOption is "All" or specific dataset, apply filtering normally
        const filteredDatasets = selectedOption === "All"
            ? datasets
            : datasets.filter(dataset => dataset.label === selectedOption);
    
        return {
            labels,
            datasets: filteredDatasets,
        };
    };

    // Define month names globally for easy reference
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const optionsMale: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            tooltip: { 
                callbacks: {
                    title: (tooltipItems: any) => {
                        const label = tooltipItems[0]?.label;
                        
                        // Find the full report_period for the given month name
                        const reportPeriod = morbidityReports.find(entry => {
                            const [, month] = entry.report_period.split("-");  // Extract month
                            return monthNames[+month - 1] === label;  // Match with the displayed month name
                        })?.report_period || "Unknown";  // Get full report_period (YYYY-MM)

                        const [year, month] = reportPeriod.split("-");
                        const monthIndex = parseInt(month, 10) - 1;
                        const monthName = monthNames[monthIndex] || "Unknown";
                        
                        return `Report Period: ${year}, ${monthName}`;
                    },
                    label: (tooltipItem: any) => {
                        const datasetLabel = tooltipItem.dataset.label || "";
                        const value = tooltipItem.raw;
                        return `${datasetLabel}: ${value}`;
                    },
                    afterLabel: (tooltipItem: any) => {
                        const monthName = tooltipItem.label;

                        const reportPeriod = morbidityReports.find(entry => {
                            const [, month] = entry.report_period.split("-");
                            return monthNames[+month - 1] === monthName; // Find the corresponding full report_period
                        })?.report_period; // Get the full 'YYYY-MM' format

                        if (!reportPeriod) {
                            return;
                        }
                        
                        const diseaseName = tooltipItem.dataset.label;
                        const aggregatedByAgeCategory: { [age: string]: number } = {};
                        const gender = tooltipItem.dataset.gender.toLowerCase() as "male" | "female";

                        morbidityReports.forEach((entry) => {
                            if (
                                entry.report_period === reportPeriod &&
                                entry.disease_name === diseaseName
                            ) {
                                if (!aggregatedByAgeCategory[entry.age_category]) {
                                    aggregatedByAgeCategory[entry.age_category] = 0;
                                }
                                if (typeof entry[gender] === "number") {
                                    aggregatedByAgeCategory[entry.age_category] += entry[gender];
                                }
                            }
                        });
                        
                        const ageCategoryDetails = Object.entries(aggregatedByAgeCategory)
                            .map(([ageCategory, total]) => `${ageCategory}: ${total}`)
                            .join("\n");

                        return `\nAge Categories:\n${ageCategoryDetails}`;
                    },
                },
            },
            legend: {
                display: selectedOptionMale !== "All" && selectedOptionMale !== "Customized",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: year ? year.toString() : "",
                },
                labels: [...new Set(morbidityReports.map(({ report_period }) => monthNames[+report_period.split("-")[1] - 1] || "Unknown"))],
            },
            y: {
                title: {
                    display: true,
                    text: "Number of Male",
                },
            },
        },
    };

    const optionsFemale: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) => {
                        const label = tooltipItems[0]?.label;
                        
                        // Find the full report_period for the given month name
                        const reportPeriod = morbidityReports.find(entry => {
                            const [, month] = entry.report_period.split("-");  // Extract month
                            return monthNames[+month - 1] === label;  // Match with the displayed month name
                        })?.report_period || "Unknown";  // Get full report_period (YYYY-MM)

                        const [year, month] = reportPeriod.split("-");
                        const monthIndex = parseInt(month, 10) - 1;
                        const monthName = monthNames[monthIndex] || "Unknown";
                        
                        return `Report Period: ${year}, ${monthName}`;
                    },
                    label: (tooltipItem: any) => {
                        const datasetLabel = tooltipItem.dataset.label || "";
                        const value = tooltipItem.raw;
                        return `${datasetLabel}: ${value}`;
                    },
                    afterLabel: (tooltipItem: any) => {
                        const monthName = tooltipItem.label;

                        const reportPeriod = morbidityReports.find(entry => {
                            const [, month] = entry.report_period.split("-");
                            return monthNames[+month - 1] === monthName; // Find the corresponding full report_period
                        })?.report_period; // Get the full 'YYYY-MM' format

                        if (!reportPeriod) {
                            return;
                        }
                        
                        const diseaseName = tooltipItem.dataset.label;
                        const aggregatedByAgeCategory: { [age: string]: number } = {};
                        const gender = tooltipItem.dataset.gender.toLowerCase() as "male" | "female";

                        morbidityReports.forEach((entry) => {
                            if (
                                entry.report_period === reportPeriod &&
                                entry.disease_name === diseaseName
                            ) {
                                if (!aggregatedByAgeCategory[entry.age_category]) {
                                    aggregatedByAgeCategory[entry.age_category] = 0;
                                }
                                if (typeof entry[gender] === "number") {
                                    aggregatedByAgeCategory[entry.age_category] += entry[gender];
                                }
                            }
                        });

                        const ageCategoryDetails = Object.entries(aggregatedByAgeCategory)
                            .map(([ageCategory, total]) => `${ageCategory}: ${total}`)
                            .join("\n");

                        return `\nAge Categories:\n${ageCategoryDetails}`;
                    },
                },
            },
            legend: {
                display: selectedOptionFemale !== "All" && selectedOptionFemale !== "Customized",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: year ? year.toString() : "",
                },
                labels: [...new Set(morbidityReports.map(({ report_period }) => monthNames[+report_period.split("-")[1] - 1] || "Unknown"))],
            },
            y: {
                title: {
                    display: true,
                    text: "Number of Female",
                },
            },
        },
    };

    const toggleSize = (chartId: string) => {
        setMaximizedCharts((prevState) => ({
            ...prevState,
            [chartId]: !prevState[chartId],
        }));
    };

    useEffect(() => {
        fetchMorbidityReports(barangay, year);
    }, [fetchMorbidityReports, barangay, year]);

    useEffect(() => {
        if(optionsMale && optionsFemale) {
            const morbidityChartData = {
                title: `Barangay ${barangay} - Morbidity Report Chart - ${year}`,
                male: {
                    data: getChartData("male"), // Function that returns the data for male chart
                    options: optionsMale         // Male chart options object
                },
                female: {
                    data: getChartData("female"), // Function that returns the data for female chart
                    options: optionsFemale        // Female chart options object
                }
            };

            const charts = {
                morbidityChartData: morbidityChartData,
            }
            
            // Store the data in localStorage
            localStorage.setItem('charts', JSON.stringify(charts));
        }
    }, [selectedOptionMale, selectedOptionFemale, optionsMale, optionsFemale, morbidityReports]);
    
    useEffect(() => {
        decrementLoading();
    }, []);


    useEffect(() => {
        setIsButtonDisabled(!(morbidityReports.length > 0));
    }, [morbidityReports, barangay, year])

    const { isMinimized } = useSidebarContext();


    const [visibilityMale, setVisibilityMale] = useState<{
        [key: string]: boolean;
    }>({});
    const [visibilityFemale, setVisibilityFemale] = useState<{
        [key: string]: boolean;
    }>({});

    const handleCheckboxChange = (
        label: string,
        gender: "male" | "female",
    ) => {
        const setVisibilityForGender = gender === "male" ? setVisibilityMale : setVisibilityFemale;

        setVisibilityForGender((prevState) => ({
            ...prevState,
            [label]: !prevState[label], // Toggle between true and false
        }));
    };
    
    const toggleAllCheckboxes = (gender: "male" | "female", datasets: any[]) => {
        const setVisibilityForGender = gender === "male" ? setVisibilityMale : setVisibilityFemale;
        const visibilityForGender = gender === "male" ? visibilityMale : visibilityFemale;
    
        // Extract labels (disease names) from the datasets
        const labels = datasets.map((dataset) => dataset.label);
    
        // Check if all labels are currently checked
        const allChecked = labels.every((label) => visibilityForGender[label]);
    
        // Update the visibility state
        setVisibilityForGender((prevState) => ({
            ...prevState,
            ...labels.reduce((acc, label) => ({
                ...acc,
                [label]: !allChecked, // Toggle all based on the current state
            }), {}),
        }));
    };
    
    const areAllChecked = (gender: "male" | "female", datasets: any[]) => {
        const visibilityForGender = gender === "male" ? visibilityMale : visibilityFemale;
    
        // Extract labels (disease names) from the datasets
        const labels = datasets.map((dataset) => dataset.label);
    
        // Check if all labels are currently visible
        return labels.every((label) => visibilityForGender[label]);
    };
    

    return (
        <section className="flex flex-col items-center py-8 mt-9 bg-almond" id="myChart" ref={chartRef}>
            <h1 id="chart-title" className={`self-center ${isMinimized ? "lg:w-11/12" : "w-full"} p-2 sm:text-lg text-sm font-bold text-center text-white align-middle rounded-lg bg-green`} ref={textRef}>Morbidity Report</h1>
            {error ? (
                <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                    <h1 className="font-bold text-center text-red-500">
                        Error: {error}
                    </h1>
                </div>
            ) : (
                morbidityReports.length > 0 ? (
                    <>
                        <div className={`flex flex-col items-center gap-8 ${isMinimized ? "lg:w-11/12" : "w-full"} print:w-full chart-container`}>
                            {/* Male Chart */}
                            <div 
                                className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md print:w-full shadow-[#a3a19d] 
                                            ${selectedOptionMale === "All" || selectedOptionMale === "Customized" ? "xl:w-full" : maximizedCharts.male ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {selectedOptionMale !== "All" && selectedOptionMale !== "Customized" && 
                                    <FontAwesomeIcon
                                        icon={maximizedCharts.male ? faMinimize : faMaximize}
                                        className="absolute top-0 right-0 hidden m-5 text-2xl transition-all cursor-pointer resize-icon xl:block hover:text-green hover:scale-125"
                                        onClick={() => toggleSize("male")}
                                    />
                                }

                                {/* Chart */}
                                <div className={`flex-1 xl:w-2/3 chart-container`}>
                                    {/* Chart Title & Dropdown Option */}
                                    <div className={`flex flex-row items-center justify-between gap-4 px-4 mb-8 ${selectedOptionMale !== "All" ? "xl:mr-8" : ""}`}>
                                        <h3 className="font-semibold text-center">Male</h3>
                                        <select 
                                            value={selectedOptionMale} 
                                            onChange={(e) => setSelectedOptionMale(e.target.value)} 
                                            className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-black rounded-lg w-fit bg-white border border-black shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All" className="font-extrabold uppercase">ALL</option>
                                            <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                            {aggregateDataByDisease("male").map((dataset, index) => (
                                                <option key={index} value={dataset.label}>
                                                    {dataset.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Line
                                        data={getChartData("male")}
                                        options={optionsMale}
                                        id="male-chart"
                                        className="justify-self-center"
                                    />
                                </div>

                                {/* Legend */}
                                {selectedOptionMale === "All" ? (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${getChartData("male").datasets.length > 10 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${getChartData("male").datasets.length > 10 ? "pb-10" : null}`}>
                                            {getChartData("male").datasets.map((dataset, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-4 rounded-sm" style={{ backgroundColor: dataset.borderColor }}></span>
                                                    <span className="text-xs">{dataset.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : selectedOptionMale === "Customized" && (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByDisease("male").length > 10 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByDisease("male").length > 10 ? "pb-10" : null}`}>
                                            {/* Check All/Uncheck All Checkbox */}
                                            <div
                                                className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                onClick={() => toggleAllCheckboxes("male", aggregateDataByDisease("male"))} // Pass gender and fullDatasets to toggleAllCheckboxes
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={areAllChecked("male", aggregateDataByDisease("male"))} // Dynamically check if all datasets for the gender are selected
                                                    className="cursor-pointer form-checkbox"
                                                    onChange={() => toggleAllCheckboxes("male", aggregateDataByDisease("male"))} // Toggle all based on gender and fullDatasets
                                                />
                                                <span className="text-xs sm:text-sm text-nowrap">
                                                    Check All / Uncheck All
                                                </span>
                                            </div>
                                            {aggregateDataByDisease("male").map((dataset, index) => (
                                                <div 
                                                    key={index} 
                                                    className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                    onClick={() =>
                                                        handleCheckboxChange(
                                                            dataset.label,
                                                            "male",
                                                        )
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            visibilityMale[
                                                                dataset.label
                                                            ]
                                                        }
                                                        className="cursor-pointer form-checkbox"
                                                    />
                                                    <span className="w-6 h-4 rounded-sm cursor-pointer" style={{ backgroundColor: dataset.borderColor }}></span>
                                                    <span className="text-xs cursor-pointer">{dataset.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
            
                            <div className="w-full h-[1px] bg-black"></div>
            
                            {/* Female Chart */}
                            <div 
                                className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                                            ${selectedOptionFemale === "All" || selectedOptionFemale === "Customized" ? "xl:w-full" : maximizedCharts.female ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {selectedOptionFemale !== "All" && selectedOptionFemale !== "Customized" && 
                                    <FontAwesomeIcon
                                        icon={maximizedCharts.female ? faMinimize : faMaximize}
                                        className="absolute top-0 right-0 hidden m-5 text-2xl transition-all cursor-pointer xl:block hover:text-green hover:scale-125 resize-icon"
                                        onClick={() => toggleSize("female")}
                                    />
                                }

                                {/* Chart */}
                                <div className={`flex-1 xl:w-2/3 chart-container`}>
                                    {/* Chart Title & Dropdown Option */}
                                    <div className={`flex flex-row items-center justify-between gap-4 px-4 mb-8 ${selectedOptionFemale !== "All" ? "xl:mr-8" : ""}`}>
                                        <h3 className="font-semibold text-center">Female</h3>
                                        <select 
                                            value={selectedOptionFemale} 
                                            onChange={(e) => setSelectedOptionFemale(e.target.value)} 
                                            className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-black rounded-lg w-fit bg-white border border-black shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All" className="font-extrabold uppercase">ALL</option>
                                            <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                            {aggregateDataByDisease("female").map((dataset, index) => (
                                                <option key={index} value={dataset.label}>
                                                    {dataset.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Line
                                        data={getChartData("female")}
                                        options={optionsFemale}
                                        id="female-chart"
                                    />
                                </div>

                                {/* Legend */}
                                {selectedOptionFemale === "All" ? (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${getChartData("female").datasets.length > 10 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${getChartData("female").datasets.length > 10 ? "pb-10" : null}`}>
                                            {getChartData("female").datasets.map((dataset, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
                                                    <span className="w-6 h-4 rounded-sm" style={{ backgroundColor: dataset.borderColor }}></span>
                                                    <span className="text-xs">{dataset.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : selectedOptionFemale === "Customized" && (
                                    <div className={`legend-container rounded-lg shadow-md shadow-[#a3a19d] overflow-hidden ${aggregateDataByDisease("female").length > 10 ? "h-56 md:h-80 xl:h-[28rem] lg:h-[25rem]" : "h-fit"} border-r xl:max-w-xs`}>
                                        <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                        <div className={`w-full h-full p-2 overflow-y-auto bg-gray-200 legend-list ${aggregateDataByDisease("female").length > 10 ? "pb-10" : null}`}>
                                            {/* Check All/Uncheck All Checkbox */}
                                            <div
                                                className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                onClick={() => toggleAllCheckboxes("female", aggregateDataByDisease("female"))} // Pass gender and fullDatasets to toggleAllCheckboxes
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={areAllChecked("female", aggregateDataByDisease("female"))} // Dynamically check if all datasets for the gender are selected
                                                    className="cursor-pointer form-checkbox"
                                                    onChange={() => toggleAllCheckboxes("female", aggregateDataByDisease("female"))} // Toggle all based on gender and fullDatasets
                                                />
                                                <span className="text-xs sm:text-sm text-nowrap">
                                                    Check All / Uncheck All
                                                </span>
                                            </div>

                                            {aggregateDataByDisease("female").map((dataset, index) => (
                                                <div 
                                                    key={index} 
                                                    className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                    onClick={() =>
                                                        handleCheckboxChange(
                                                            dataset.label,
                                                            "female",
                                                        )
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            visibilityFemale[
                                                                dataset.label
                                                            ]
                                                        }
                                                        className="cursor-pointer form-checkbox"
                                                    />
                                                    <span className="w-6 h-4 rounded-sm cursor-pointer" style={{ backgroundColor: dataset.borderColor }}></span>
                                                    <span className="text-xs cursor-pointer">{dataset.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    (barangay ?? "") === "" ? (
                        <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                            <h1 className="text-center">
                                It seems no valid barangay has been selected. Kindly choose one from the list.
                            </h1>
                        </div>
                    ) : barangay === "all" ? (
                        <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                            <h1 className="text-center">
                                No submitted reports were found for any barangay for the year {year}.
                            </h1>
                        </div>
                    ) : (
                        <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                            <h1 className="text-center">
                                No submitted reports were found for Barangay {barangay} for the year {year}.
                            </h1>
                        </div>
                    )
                )
            )}
        </section>
    );
};

export default MorbidityFormChart;
