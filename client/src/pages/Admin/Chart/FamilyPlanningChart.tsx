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
    ChartData,
} from "chart.js";
import { baseAPIUrl } from "../../../config/apiConfig";
import { useLoading } from "../../../context/LoadingContext";
import { faMinimize, faMaximize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement
);

interface FamilyPlanningReport {
    report_id: number;
    method_name: string;
    current_users_beginning_month: number;
    new_acceptors_prev_month: number;
    other_acceptors_present_month: number;
    drop_outs_present_month: number;
    current_users_end_month: number;
    new_acceptors_present_month: number;
    barangay_name: string;
    report_period: string;
    age_category: string;
}

interface FamilyPlanningChartProps {
    barangay: string;
    year: String | null;
    setIsButtonDisabled: (value: boolean) => void;
}

const FamilyPlanningChart: React.FC<FamilyPlanningChartProps> = ({
    barangay,
    year,
    setIsButtonDisabled
}) => {
    // State declarations
    const [data, setData] = useState<FamilyPlanningReport[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
    const [maximizedCharts, setMaximizedCharts] = useState<{ [key: number]: boolean }>({});

    // Loading handlers
    const { incrementLoading, decrementLoading } = useLoading();

    // Data fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                incrementLoading();
                const response = await fetch(
                    `${baseAPIUrl}/family-planning-reports`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ barangay_name: barangay, year: Number(year) })
                    }
                );

                if (!response.ok) {
                    let errorMessage = `An error occurred while fetching the data: ${response.statusText}. Please reload or try again later.`;
    
                    // Handle specific status codes with friendly messages
                    if (response.status >= 500) {
                        errorMessage = "Server is currently unavailable. Please try again later.";
                    } else if (response.status === 404) {
                        errorMessage = "The requested data could not be found.";
                    } else if (response.status === 401 || response.status === 403) {
                        errorMessage = "You do not have permission to access this data.";
                    }
    
                    throw new Error(errorMessage);
                }
    
                const result = await response.json();
    
                if (result.status !== "success" || !Array.isArray(result.data)) {
                    throw new TypeError("Unexpected data format received.");
                }

                setData(result.data);
            } catch (error: any) {
                setError(error.message || "Something went wrong. Please try again.");
            } finally {
                decrementLoading();
            }
        };

        fetchData();
    }, [barangay, year]);

    // Data processing functions
    const labels = Array.from(
        new Set(data.map((entry) => entry.report_period))
    );

    const aggregateData = (key: keyof FamilyPlanningReport, filteredData: FamilyPlanningReport[]) => {
        const aggregated: { [key: string]: number } = {};
        filteredData.forEach((entry) => {
            if (typeof entry[key] === "number") {
                if (!aggregated[entry.report_period]) {
                    aggregated[entry.report_period] = 0;
                }
                aggregated[entry.report_period] += entry[key];
            }
        });
        return labels.map((label) => aggregated[label] || 0);
    };

    const capitalize = (text: string) =>
        text
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

    // Color generation
    const reportColors = useMemo(() => {
        const colors: { [key: string]: string } = {
            current_users_beginning_month: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            new_acceptors_prev_month: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            other_acceptors_present_month: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            drop_outs_present_month: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            current_users_end_month: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            new_acceptors_present_month: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
        };

        return colors;
    }, []);

    // Dataset generation
    const getDataset = (key: keyof FamilyPlanningReport, filteredData: FamilyPlanningReport[]) => ({
        label: capitalize((key.replace(/_/g, " "))),
        data: aggregateData(key, filteredData),
        fill: false,
        borderColor: reportColors[key as string],
        backgroundColor: reportColors[key as string],
        tension: 0.1,
        hidden: false,
    });

    // Chart data generation
    const chartData = (ageCategory: string, filteredData: FamilyPlanningReport[], selectedOption: string): ChartData<"line"> => {
        const datasets = [
            getDataset("current_users_beginning_month", filteredData),
            getDataset("new_acceptors_prev_month", filteredData),
            getDataset("other_acceptors_present_month", filteredData),
            getDataset("drop_outs_present_month", filteredData),
            getDataset("current_users_end_month", filteredData),
            getDataset("new_acceptors_present_month", filteredData),
        ];

        const filteredDatasets = selectedOption === "All" 
        ? datasets 
        : selectedOption === "Customized"
            ? datasets.filter(dataset => visibilityState[ageCategory]?.[dataset.label] === false)
            : datasets.filter(dataset => dataset.label === selectedOption);

        return {
            labels,
            datasets: filteredDatasets,
        };
    };

    // Label generation
    const getLabels = (filteredData: FamilyPlanningReport[]): { label: string; color: string }[] => {
        const datasets = [
            getDataset("current_users_beginning_month", filteredData),
            getDataset("new_acceptors_prev_month", filteredData),
            getDataset("other_acceptors_present_month", filteredData),
            getDataset("drop_outs_present_month", filteredData),
            getDataset("current_users_end_month", filteredData),
            getDataset("new_acceptors_present_month", filteredData),
        ];

        return datasets.map(dataset => ({
            label: capitalize(dataset.label),
            color: dataset.borderColor,
        }));
    };

    // Month Names
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

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            // title: {
            //     display: true,
            //     text: 'Family Planning Report'
            // },
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) => {
                        const label = tooltipItems[0]?.label;
                        // Find the full report_period for the given month name
                        const reportPeriod = data.find(entry => {
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
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: year ? year.toString() : "",
                },
                labels: [...new Set(data.map(({ report_period }) => monthNames[+report_period.split("-")[1] - 1] || "Unknown"))],
            },
            y: {
                title: {
                    display: true,
                    text: "Number of Users",
                },
            },
        },
    };

    // Age categories
    const ageCategories = ["10-14", "15-19", "20-49"];

    // Toggle function for maximizing charts
    const toggleSize = (index: number) => {
        setMaximizedCharts((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    // Define initial state for dynamic category visibility
    const [visibilityState, setVisibilityState] = useState<{ [key: string]: { [key: string]: boolean } }>({
        "10-14": {
        },
        "15-19": {
        },
        "20-29": {
        },
    });

    useEffect(() => {
        if (options) {
            const fpChartData = {
                title: `${barangay === "all" ? "All Barangay" : `Barangay ${capitalize(barangay)}`} - Family Planning Chart - ${year}`,
                "10-14": {
                    data: chartData("10-14", data.filter(entry => entry.age_category === "10-14"), selectedOptions["10-14"] || "All"),
                    options: options,
                    selectedOption: selectedOptions["10-14"] || "All",
                },
                "15-19": {
                    data: chartData("15-19", data.filter(entry => entry.age_category === "15-19"), selectedOptions["15-19"] || "All"),
                    options: options,
                    selectedOption: selectedOptions["15-19"] || "All",
                },
                "20-49": {
                    data: chartData("20-49", data.filter(entry => entry.age_category === "20-49"), selectedOptions["20-49"] || "All"),
                    options: options,
                    selectedOption: selectedOptions["20-49"] || "All",
                },
            };
    
            const charts = {
                fpChartData: fpChartData,
            }
            
            // Store the data in localStorage
            localStorage.setItem('charts', JSON.stringify(charts));
        }
    }, [selectedOptions, options, data, barangay, year, visibilityState]);

    
    useEffect(() => {
            setIsButtonDisabled(!(data.length > 0));
    }, [data, barangay, year])

    // Handler for checkbox change - dynamically handles any category and key visibility
    const handleCheckboxChange = (subCategory: string, key: string) => {
        setVisibilityState((prevState) => {
            const subCategoryVisibility = prevState[subCategory] || {};

            return {
                ...prevState,
                [subCategory]: {
                    ...subCategoryVisibility,
                    // Toggle the visibility of the key or set it to true if undefined
                    [key]: subCategoryVisibility[key] !== undefined ? !subCategoryVisibility[key] : false,
                },
            };
        });
    };

    const toggleAllCheckboxes = (fullDatasets: any[], ageCategory?: string) => {
        const newVisibilityState: { [key: string]: { [key: string]: boolean } } = {};
    
        // Determine the firstKey to use: either valueType, ageCategory, or fallback to dataset.label
        const firstKey = ageCategory || fullDatasets.map(dataset => dataset.label);
    
        // Iterate over the selected firstKey (singular value or dataset label)
        if (Array.isArray(firstKey)) {
            firstKey.forEach(key => {
                newVisibilityState[key] = {};
    
                fullDatasets.forEach(dataset => {
                    newVisibilityState[key][dataset.label] = areAllChecked(fullDatasets, key);
                });
            });
        } else {
            // If firstKey is a singular value (not an array)
            newVisibilityState[firstKey] = {};
    
            fullDatasets.forEach(dataset => {
                newVisibilityState[firstKey][dataset.label] = areAllChecked(fullDatasets, firstKey);
            });
        }
    
        // Merge newVisibilityState with the previous state to retain existing values
        setVisibilityState(prevState => ({
            ...prevState,
            ...newVisibilityState
        }));
    };
    
    const areAllChecked = (fullDatasets: any[], firstKey?: string) => {
        return fullDatasets.every(dataset => {
            // Check visibility for the specific key (valueType or ageCategory) or fallback to dataset.label
            const key = firstKey || dataset.label;
            return visibilityState[key]?.[dataset.label] === false;
        });
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
                data.length > 0 ? (
                    <>
                        {ageCategories.map((ageCategory, index) => {
                            const filteredData = data.filter(
                                (entry) => entry.age_category === ageCategory
                            );
                            const isMaximized = maximizedCharts[index];

                            // Set default selected option for the current age category if it doesn't exist
                            const currentSelectedOption = selectedOptions[ageCategory] || "All";

                            return (
                                <div
                                    key={index}
                                    className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg xl:flex-row transition-all w-full shadow-md shadow-[#a3a19d]
                                        ${currentSelectedOption === "All" || currentSelectedOption === "Customized" ? "xl:w-full" : isMaximized ? "xl:w-full" : "xl:w-9/12"}`}
                                >   
                                    {/* Resize Icon */}
                                    {currentSelectedOption !== "All" && currentSelectedOption !== "Customized" && (
                                        <FontAwesomeIcon
                                            icon={isMaximized ? faMinimize : faMaximize}
                                            className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125 resize-icon"
                                            onClick={() => toggleSize(index)}
                                        />
                                    )}              
                                    
                                    {/* Chart */}
                                    <div className={`flex-1 xl:w-2/3`}>
                                        {/* Chart Title & Dropdown Option */}
                                        <div className={`flex print:flex-row flex-col md:flex-row xl:flex-row items-center justify-between gap-4 px-4 mb-8 ${currentSelectedOption !== "All" ? "mr-8" : ""}`}>
                                            <h3 className="font-semibold text-center">
                                                User of Family Planning Method for {ageCategory} years old
                                            </h3>
                                            <select 
                                                value={currentSelectedOption} 
                                                onChange={(e) => setSelectedOptions({
                                                    ...selectedOptions,
                                                    [ageCategory]: e.target.value,
                                                })} 
                                                className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-black rounded-lg w-full sm:w-fit bg-white border border-black shadow-md shadow-[#a3a19d]"
                                            >
                                                <option value="All" className="font-extrabold uppercase">ALL</option>
                                                <option value="Customized" className="font-extrabold uppercase">CUSTOMIZED</option>
                                                {getLabels(filteredData).map(({ label }, index) => (
                                                    <option key={index} value={label}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <Line
                                            data={chartData(ageCategory, filteredData, currentSelectedOption)}
                                            options={{
                                                ...options,
                                                plugins: {
                                                    ...options.plugins,
                                                    legend: {
                                                        display: currentSelectedOption !== "All" && currentSelectedOption !== "Customized", // Hide legend if "All" is selected
                                                    },
                                                    tooltip: {
                                                        ...options.plugins.tooltip,
                                                        callbacks: {
                                                            ...options.plugins.tooltip.callbacks,
                                                            afterLabel: (tooltipItem: any) => {
                                                                const monthName = tooltipItem.label; // The month name displayed on the x-axis
                                                                const reportPeriod = filteredData.find(entry => {
                                                                    const [, month] = entry.report_period.split("-");
                                                                    return monthNames[+month - 1] === monthName; // Find the corresponding full report_period
                                                                })?.report_period; // Get the full 'YYYY-MM' format
                                        
                                                                if (reportPeriod) {
                                                                    const methods: { [key: string]: number } = {};
                                        
                                                                    filteredData.forEach((entry) => {
                                                                        if (entry.report_period === reportPeriod) {
                                                                            const key = tooltipItem.dataset.label
                                                                                .toLowerCase()
                                                                                .replace(/ /g, "_") as keyof FamilyPlanningReport;
                                                                            if (typeof entry[key] === "number") {
                                                                                methods[entry.method_name] =
                                                                                    (methods[entry.method_name] || 0) + entry[key];
                                                                            }
                                                                        }
                                                                    });
                                        
                                                                    const methodDetails = Object.entries(methods)
                                                                        .map(([method, count]) => `${method}: ${count}`)
                                                                        .join("\n");
                                        
                                                                    return `\nMethods:\n${methodDetails}`;
                                                                }
                                                                return ''; // Return empty if no corresponding reportPeriod is found
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </div>

                                    {/* Legend */}
                                    {currentSelectedOption === "All" ? (
                                        <div className="h-full rounded-lg legend-container shadow-md shadow-[#a3a19d]">
                                            <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                            <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 border-r rounded-b-lg legend-list">
                                                {getLabels(filteredData).map(({ label, color }, index) => (
                                                    <div key={index} className="flex items-center gap-2 mb-2">
                                                        <span className="w-12 h-4 rounded-sm" style={{
                                                            backgroundColor: color,
                                                            minWidth: '1rem',
                                                            minHeight: '1rem', 
                                                            maxWidth: '1rem',
                                                            maxHeight: '1rem',
                                                        }}></span>
                                                        <span className="text-xs">{label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : currentSelectedOption === "Customized" && (
                                        <div className="h-full rounded-lg legend-container shadow-md shadow-[#a3a19d]">
                                            <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>

                                            <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 border-r rounded-b-lg legend-list">
                                                {/* Check All/Uncheck All Checkbox */}
                                                <div
                                                    className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                    onClick={() => toggleAllCheckboxes(getLabels(filteredData), ageCategory)} // Pass fullDatasets to toggleAllCheckboxes
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={areAllChecked(getLabels(filteredData), ageCategory)} // Check if all datasets are selected
                                                        className="cursor-pointer form-checkbox"
                                                        onChange={() => toggleAllCheckboxes(getLabels(filteredData), ageCategory)} // Toggle all based on fullDatasets
                                                    />
                                                    <span className="text-xs sm:text-sm text-nowrap">
                                                        Check All / Uncheck All
                                                    </span>
                                                </div>


                                                {getLabels(filteredData).map(({ label, color }, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                        onClick={() => handleCheckboxChange(ageCategory, label)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={visibilityState[ageCategory]?.[label] === false}
                                                            className="cursor-pointer form-checkbox"
                                                            readOnly
                                                        />
                                                        <span className="w-12 h-4 rounded-sm cursor-pointer" style={{
                                                            backgroundColor: color,
                                                            minWidth: '1rem',
                                                            minHeight: '1rem', 
                                                            maxWidth: '1rem',
                                                            maxHeight: '1rem',
                                                        }}></span>
                                                        <span className="text-xs cursor-pointer">{label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )} 
                                </div>
                            );
                        })}
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
        </>
    );
};

export default FamilyPlanningChart;
