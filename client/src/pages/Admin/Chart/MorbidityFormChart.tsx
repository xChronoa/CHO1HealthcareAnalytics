import React, { useEffect, useMemo, useRef, useState } from "react";
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
import {
    useMorbidityReport,
} from "../../../hooks/useMorbidityReport";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement
);

const MorbidityFormChart: React.FC = () => {
    const { error, morbidityReports, fetchMorbidityReports } =
        useMorbidityReport();
    const [selectedAgeCategory, setSelectedAgeCategory] = useState<
        string | null
    >(null);
    const [lastChecked, setLastChecked] = useState<string | null>(null); // To track last checked checkbox
    const shiftPressed = useRef(false); // Track Shift key press state

    const diseaseColors = useMemo(() => {
        // Initialize disease color map once
        const colors: { [disease: string]: string } = {};
        morbidityReports.forEach((entry) => {
            if (!colors[entry.disease_name]) {
                colors[entry.disease_name] = `#${Math.floor(
                    Math.random() * 16777215
                ).toString(16)}`;
            }
        });
        return colors;
    }, [morbidityReports]);

    useEffect(() => {
        fetchMorbidityReports();
    }, [fetchMorbidityReports]);

    const labels = Array.from(
        new Set(morbidityReports.map((entry) => entry.report_period))
    );

    const aggregateDataByDisease = (key: "male" | "female") => {
        const aggregated: { [disease: string]: { [period: string]: number } } =
            {};

        morbidityReports.forEach((entry) => {
            if (typeof entry[key] === "number") {
                if (!aggregated[entry.disease_name]) {
                    aggregated[entry.disease_name] = {};
                }
                if (!aggregated[entry.disease_name][entry.report_period]) {
                    aggregated[entry.disease_name][entry.report_period] = 0;
                }
                aggregated[entry.disease_name][entry.report_period] +=
                    entry[key];
            }
        });

        return Object.entries(aggregated).map(([disease, periods]) => ({
            label: disease,
            data: labels.map((label) => periods[label] || 0),
            fill: false,
            borderColor: diseaseColors[disease], // Use assigned color
            backgroundColor: diseaseColors[disease], // Use assigned color
            tension: 0.1,
            gender: key,
            hidden:
                key === "male"
                    ? visibilityMale[disease] === false
                    : visibilityFemale[disease] === false,
        }));
    };

    const getChartData = (key: "male" | "female") => ({
        labels,
        datasets: aggregateDataByDisease(key),
    });

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) => {
                        const label = tooltipItems[0]?.label;
                        const [year, month] = label
                            ? label.split("-")
                            : ["Unknown", "Unknown"];
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
                        const reportPeriod = tooltipItem.label;
                        const diseaseName = tooltipItem.dataset.label;
                        const aggregatedByAgeCategory: {
                            [age: string]: number;
                        } = {};

                        // Extract gender from dataset label
                        const gender =
                            tooltipItem.dataset.gender.toLowerCase() as
                                | "male"
                                | "female";

                        // Filter data based on the current report period, disease name, and gender
                        morbidityReports.forEach((entry) => {
                            if (
                                entry.report_period === reportPeriod &&
                                entry.disease_name === diseaseName
                            ) {
                                if (
                                    !aggregatedByAgeCategory[entry.age_category]
                                ) {
                                    aggregatedByAgeCategory[
                                        entry.age_category
                                    ] = 0;
                                }
                                // Aggregate values by age category based on gender
                                if (typeof entry[gender] === "number") {
                                    aggregatedByAgeCategory[
                                        entry.age_category
                                    ] += entry[gender];
                                }
                            }
                        });

                        // Format the output for the tooltip
                        const ageCategoryDetails = Object.entries(
                            aggregatedByAgeCategory
                        )
                            .map(
                                ([ageCategory, total]) =>
                                    `${ageCategory}: ${total}`
                            )
                            .join("\n");

                        return `\nAge Categories:\n${ageCategoryDetails}`;
                    },
                },
            },
            legend: {
                display: false,
                position: "left",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 10, // Adjust width of the legend box
                },
                align: "start",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Year-Month",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Values",
                },
            },
        },
    };

    const [visibilityMale, setVisibilityMale] = useState<{
        [key: string]: boolean;
    }>({});
    const [visibilityFemale, setVisibilityFemale] = useState<{
        [key: string]: boolean;
    }>({});

    const handleCheckboxChange = (
        label: string,
        gender: "male" | "female",
        event?: React.MouseEvent
    ) => {
        const setVisibilityForGender =
            gender === "male" ? setVisibilityMale : setVisibilityFemale;

        if (shiftPressed.current && lastChecked) {
            const checkboxes = getChartData(gender).datasets.map(
                (dataset) => dataset.label
            );
            const start = checkboxes.indexOf(lastChecked);
            const end = checkboxes.indexOf(label);
            const range = checkboxes.slice(
                Math.min(start, end),
                Math.max(start, end) + 1
            );

            setVisibilityForGender((prevState) => {
                const newVisibility = { ...prevState };
                range.forEach((checkbox) => {
                    newVisibility[checkbox] = !prevState[lastChecked]; // Toggle based on lastChecked state
                });
                return newVisibility;
            });
        } else {
            setVisibilityForGender((prevState) => ({
                ...prevState,
                [label]: !prevState[label], // Toggle between true and false
            }));
            setLastChecked(label);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey) {
                shiftPressed.current = true;
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (!event.shiftKey) {
                shiftPressed.current = false;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const downloadChart = () => {
        // Get all canvas elements within the #myChart div
        const canvases = document.querySelectorAll("#myChart canvas");

        // Loop through each canvas and download its image
        canvases.forEach((canvas, index) => {
            if (canvas instanceof HTMLCanvasElement) {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `chart_${index + 1}.png`; // Give each file a unique name
                link.click();
            } else {
                alert(
                    "Unable to download chart. Please ensure the charts are visible."
                );
            }
        });
    };

    return (
        <div>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <div className="flex flex-col gap-8" id="myChart">
                    <div className="flex flex-row items-center justify-between w-9/12 gap-8 mb-8 options">
                        <button
                            onClick={downloadChart}
                            className="transition-all self-end my-4 shadow-md shadow-[#a3a19d] text-[.7rem] sm:text-sm text-white inline-flex items-center bg-green hover:bg-[#009900] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                        >
                            Download Charts
                        </button>
                    </div>
                    <div className="flex flex-col-reverse gap-4 p-4 bg-white rounded-lg sm:flex-row-reverse">
                        <div className="h-56 pr-4 overflow-y-auto border-r md:h-80 lg:h-96 sm:w-1/3">
                            <h3 className="mb-2 text-lg font-semibold">
                                Legend
                            </h3>
                            {getChartData("male").datasets.map(
                                (dataset, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 mb-2 cursor-pointer select-none"
                                        onClick={(event) =>
                                            handleCheckboxChange(
                                                dataset.label,
                                                "male",
                                                event
                                            )
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                visibilityMale[
                                                    dataset.label
                                                ] !== false
                                            }
                                            readOnly
                                            className="form-checkbox"
                                        />
                                        <span
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    dataset.borderColor,
                                            }}
                                        ></span>
                                        <span className="text-sm">
                                            {dataset.label}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="flex-1 sm:w-2/3">
                            <h3 className="mb-4 font-semibold text-center">
                                Male Data
                            </h3>
                            <Line
                                data={getChartData("male")}
                                options={options}
                            />
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-black"></div>

                    <div className="flex flex-col-reverse gap-2 p-4 bg-white rounded-lg sm:flex-row-reverse">
                        <div className="h-56 pr-4 overflow-y-auto border-r md:h-80 lg:h-96 sm:w-1/3">
                            <h3 className="mb-2 text-lg font-semibold">
                                Legend
                            </h3>
                            {getChartData("female").datasets.map(
                                (dataset, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 mb-2 cursor-pointer select-none"
                                        onClick={(event) =>
                                            handleCheckboxChange(
                                                dataset.label,
                                                "female",
                                                event
                                            )
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                visibilityFemale[
                                                    dataset.label
                                                ] !== false
                                            }
                                            readOnly
                                            className="form-checkbox"
                                        />
                                        <span
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    dataset.borderColor,
                                            }}
                                        ></span>
                                        <span className="text-sm">
                                            {dataset.label}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="flex-1 sm:w-2/3">
                            <h3 className="mb-4 font-semibold text-center">
                                Female Data
                            </h3>
                            <Line
                                data={getChartData("female")}
                                options={options}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MorbidityFormChart;
