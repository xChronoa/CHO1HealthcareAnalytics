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

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement
);

interface MorbidityFormChartProps {
    chartRef: React.RefObject<HTMLDivElement>;
    textRef: React.RefObject<HTMLHeadingElement>;
    barangay: string;
    year: String | null;
}

const MorbidityFormChart: React.FC<MorbidityFormChartProps> = ({
    chartRef,
    textRef,
    barangay,
    year,
}) => {
    // State management
    const [selectedOptionMale, setSelectedOptionMale] = useState<string>("All");
    const [selectedOptionFemale, setSelectedOptionFemale] = useState<string>("All");
    const [maximizedCharts, setMaximizedCharts] = useState<{ [key: string]: boolean }>({
        male: false,
        female: false,
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
        }));

        return datasets;
    };

    const getChartData = (key: "male" | "female") => {
        const selectedOption = key === "male" ? selectedOptionMale : selectedOptionFemale;
        const datasets = aggregateDataByDisease(key);

        // Filter datasets based on the selected option
        const filteredDatasets = selectedOption === "All" ? datasets : datasets.filter(dataset => dataset.label === selectedOption);

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
                        const [_, month] = label ? label.split("-") : ["Unknown"];
                        const monthIndex = parseInt(month, 10) - 1;
                        const monthName = monthNames[monthIndex] || "Unknown";
                        return `Report Period: ${monthName}`;
                    },
                    label: (tooltipItem: any) => {
                        const datasetLabel = tooltipItem.dataset.label || "";
                        const value = tooltipItem.raw;
                        return `${datasetLabel}: ${value}`;
                    },
                    afterLabel: (tooltipItem: any) => {
                        const reportPeriod = tooltipItem.label;
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
                display: selectedOptionMale !== "All",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: year ? year.toString() : "",
                },
                ticks: {
                    callback: (value) => {
                        // Ensure value is a number
                        const monthIndex = Number(value) % 12;
                        return monthNames[monthIndex] || "Unknown"; // Use the monthNames variable
                    }, // Adjust based on the data array format
                },
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
                        const [_, month] = label ? label.split("-") : ["Unknown"];
                        const monthIndex = parseInt(month, 10) - 1;
                        const monthName = monthNames[monthIndex] || "Unknown";
                        return `Report Period: ${monthName}`;
                    },
                    label: (tooltipItem: any) => {
                        const datasetLabel = tooltipItem.dataset.label || "";
                        const value = tooltipItem.raw;
                        return `${datasetLabel}: ${value}`;
                    },
                    afterLabel: (tooltipItem: any) => {
                        const reportPeriod = tooltipItem.label;
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
                display: selectedOptionFemale !== "All",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: year ? year.toString() : "",
                },
                ticks: {
                    callback: (value) => {
                        // Ensure value is a number
                        const monthIndex = Number(value) % 12;
                        return monthNames[monthIndex] || "Unknown"; // Use the monthNames variable
                    }, // Adjust based on the data array format
                },
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
        if (chartRef.current) {
            chartRef.current.dataset.isSubmitted = morbidityReports.length > 0 ? 'true' : 'false';
        }
    }, [chartRef, morbidityReports, barangay, year]);

    useEffect(() => {
        decrementLoading();
    }, []);

    return (
        <section className="flex flex-col items-center py-8 bg-almond" id="myChart" ref={chartRef}>
            <h1 id="chart-title" className="self-center w-full p-2 text-2xl font-bold text-center text-white align-middle rounded-lg lg:w-9/12 bg-green" ref={textRef}>Morbidity Report</h1>
            {error ? (
                <div className="w-full p-12 bg-white rounded-b-lg shadow-md no-submitted-report shadow-gray-400">
                    <h1 className="font-bold text-center text-red-500">
                        Error: {error}
                    </h1>
                </div>
            ) : (
                morbidityReports.length > 0 ? (
                    <>
                        <div className="flex flex-col items-center w-full gap-8 lg:w-9/12 print:w-full chart-container">
                            {/* Male Chart */}
                            <div 
                                className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md print:w-full shadow-[#a3a19d] 
                                            ${selectedOptionMale === "All" ? "xl:w-full" : maximizedCharts.male ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {selectedOptionMale !== "All" && 
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
                                            className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-white rounded-lg w-fit bg-green shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All">All</option>
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
                                {selectedOptionMale === "All" && (
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
                                )}
                            </div>
            
                            <div className="w-full h-[1px] bg-black"></div>
            
                            {/* Female Chart */}
                            <div 
                                className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                                            ${selectedOptionFemale === "All" ? "xl:w-full" : maximizedCharts.female ? "xl:w-full" : "xl:w-9/12"}`}
                            >
                                {/* Resize Icon */}
                                {selectedOptionFemale !== "All" && 
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
                                            className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-white rounded-lg w-fit bg-green shadow-md shadow-[#a3a19d]"
                                        >
                                            <option value="All">All</option>
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
                                {selectedOptionFemale === "All" && (
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
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full p-12 bg-white rounded-b-lg shadow-md lg:w-9/12 no-submitted-report shadow-gray-400">
                        <h1 className="text-center">
                            No submitted reports were found for Barangay {barangay} for the year {year}. 
                        </h1>
                    </div>
                )
            )}
        </section>
    );
};

export default MorbidityFormChart;
