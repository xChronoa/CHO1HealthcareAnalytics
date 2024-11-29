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
    ChartOptions,
} from "chart.js";
import { useWra } from "../../../hooks/useWra";
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

interface ModernWRAProps {
    barangay: string;
    year: String | null;
    setIsButtonDisabled: (value: boolean) => void;
}

const ModernWRAChart: React.FC<ModernWRAProps> = ({ 
    barangay, 
    year, 
    setIsButtonDisabled
}) => {
    const { wraData, error, fetchWra } = useWra();
    const [isMaximized, setIsMaximized] = useState<boolean>(true);
    const [selectedOption, setSelectedOption] = useState("All");

    useEffect(() => {
        fetchWra(barangay, year);
    }, [fetchWra, barangay, year]);

    const labels = Array.from(new Set(wraData.map((entry) => entry.report_period)));

    const aggregateData = (ageCategory: string) => {
        const aggregated: { [key: string]: number } = {};
        wraData.filter(entry => entry.age_category === ageCategory)
            .forEach((entry) => {
                if (typeof entry.unmet_need_modern_fp === "number") {
                    if (!aggregated[entry.report_period]) {
                        aggregated[entry.report_period] = 0;
                    }
                    aggregated[entry.report_period] += entry.unmet_need_modern_fp;
                }
            });
        return labels.map((label) => aggregated[label] || 0);
    };

    const capitalize = (text: string) =>
        text.toLowerCase().replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

    const ageCategories = Array.from(new Set(wraData.map(entry => entry.age_category)));

    const generateColor = (): string => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    const ageColors = useMemo(() => {
        const colors: { [key: string]: string } = {};
        ageCategories.forEach((category) => {
            colors[category] = generateColor();
        });
        return colors;
    }, [wraData]);

    const chartData = (): ChartData<"line"> => {
        // If selectedOption is "Customized", filter the datasets based on visibility
        if (selectedOption === "Customized") {
            return {
                labels,
                datasets: ageCategories.map((category) => ({
                    label: capitalize(category),
                    data: aggregateData(category),
                    fill: false,
                    borderColor: ageColors[category],
                    backgroundColor: ageColors[category],
                    tension: 0.1,
                    hidden: visibilityState[category] === false || visibilityState[category] === undefined, // Toggle visibility
                })),
            };
        }
    
        // If selectedOption is "All", include all datasets regardless of age category selection
        const filteredAgeCategories = selectedOption === "All"
            ? ageCategories // Don't filter any categories when "All" is selected
            : ageCategories.filter((category) => category === selectedOption); // Filter based on selected option
    
        return {
            labels,
            datasets: filteredAgeCategories.map((category) => ({
                label: capitalize(category),
                data: aggregateData(category),
                fill: false,
                borderColor: ageColors[category],
                backgroundColor: ageColors[category],
                tension: 0.1,
                hidden: false,
            })),
        };
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) => {
                        const label = tooltipItems[0]?.label;
                        
                        // Find the full report_period for the given month name
                        const reportPeriod = wraData.find(entry => {
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
            legend: {
                display: selectedOption !== "All" && selectedOption !== "Customized",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: year ? year.toString() : "",
                },
                labels: [...new Set(wraData.map(({ report_period }) => monthNames[+report_period.split("-")[1] - 1] || "Unknown"))],
            },
            y: {
                title: {
                    display: true,
                    text: "Number of Women of Reproductive Age",
                },
            },
        },
    };

    const toggleSize = () => setIsMaximized(prev => !prev);
    const [visibilityState, setVisibilityState] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if(options) {
            const wraChartData = {
                title:  `${barangay === "all" ? "All Barangay" : `Barangay ${capitalize(barangay)}`} - Modern FP Unmet Need Chart - ${year}`,
                data: chartData(), // Function that returns the data for male chart
                options: options         // Male chart options object
            };

            const charts = {
                wraChartData: wraChartData,
            }
            
            // Store the data in localStorage
            localStorage.setItem('charts', JSON.stringify(charts));
        }
    }, [selectedOption, options, wraData, barangay, year, visibilityState])

    useEffect(() => {
        setIsButtonDisabled(!(wraData.length > 0));
    }, [wraData, barangay, year, visibilityState])

    // Define initial state for visibility for dynamic categories

    // Handler for checkbox change - dynamically handles any label and category
    const handleCheckboxChange = (label: string) => {
        setVisibilityState((prevState) => ({
            ...prevState,
            [label]: prevState[label] !== undefined ? !prevState[label] : true, // Toggle or set to true if undefined
        }));
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
                wraData.length > 0 ? (
                    <div 
                        className={`chart relative flex flex-col gap-2 p-4 bg-white rounded-lg md:flex-row transition-all w-full shadow-md shadow-[#a3a19d] 
                                    ${selectedOption === "All" || selectedOption === "Customized" ? "sm:w-full" : isMaximized ? "sm:w-full" : "sm:w-9/12"}`}
                    >
                        <>
                            {selectedOption !== "All" && selectedOption !== "Customized" && (
                                <FontAwesomeIcon
                                    icon={isMaximized ? faMinimize : faMaximize}
                                    className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125 resize-icon"
                                    onClick={toggleSize}
                                />
                            )}
                            
                            <div className="flex-1 md:w-2/3 chart-container">
                                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 mb-8 ${selectedOption !== "All" ? "mr-8" : ""}`}>
                                    <h3 className="font-semibold text-center">Unmet Need for Modern Family Planning</h3>
                                    <select 
                                        value={selectedOption} 
                                        onChange={(e) => setSelectedOption(e.target.value)} 
                                        className="px-2 py-2 text-[9.5px] sm:text-xs font-bold text-black border border-black rounded-lg w-full sm:w-fit bg-white shadow-md shadow-[#a3a19d]"
                                    >
                                        <option value="All">All</option>
                                        <option value="Customized">Customized</option>
                                        {ageCategories.map((category, index) => (
                                            <option key={index} value={category}>
                                                {capitalize(category)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
        
                                <Line
                                    data={chartData()}
                                    options={options}
                                    id="wra-chart"
                                />
                            </div>
        
                            {selectedOption === "All" ? (
                                <div className="h-full legend-container shadow-md shadow-[#a3a19d] rounded-lg">
                                    <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>
                                    <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 border-r rounded-b-lg legend-list">
                                        {chartData().datasets.map((dataset, index) => (
                                            <div key={index} className="flex items-center justify-center gap-2 mb-2">
                                                <span className="w-12 h-4 rounded-sm" style={{ backgroundColor: dataset.borderColor?.toString() }}></span>
                                                <span className="text-xs sm:text-sm text-nowrap">{dataset.label} years old</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : selectedOption === "Customized" && (
                                <div className="h-full legend-container shadow-md shadow-[#a3a19d] rounded-lg">
                                    <h3 className="px-2 py-2 text-xs font-semibold text-center text-white uppercase rounded-t-lg sm:text-sm bg-green">Legend</h3>
                                    <div className="w-full h-full p-2 overflow-y-auto bg-gray-200 border-r rounded-b-lg legend-list">
                                    {ageCategories.map((category, index) => {
                                        // Find the dataset that corresponds to the category
                                        const dataset = chartData().datasets.find((ds) => ds.label === capitalize(category));

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-2 py-1 mb-2 transition-all rounded-md cursor-pointer select-none hover:bg-blue-500 hover:text-white"
                                                onClick={() => handleCheckboxChange(category)} // Handles the click event to toggle state
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={visibilityState[category]} // This binds the checkbox to the visibilityState
                                                    className="cursor-pointer form-checkbox"
                                                    onChange={() => handleCheckboxChange(category)} // Ensure the checkbox toggles when clicked
                                                />
                                                <span
                                                    className="w-12 h-4 rounded-sm"
                                                    style={{ backgroundColor: dataset?.borderColor?.toString() }} // Ensure dataset exists
                                                ></span>
                                                <span className="text-xs sm:text-sm text-nowrap">{dataset?.label} years old</span>
                                            </div>
                                        );
                                    })}
                                    </div>
                                </div>
                            )}
                        </>
                    </div>
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

export default ModernWRAChart;
