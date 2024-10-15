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
import Loading from "../../../components/Loading";
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

const FamilyPlanningChart: React.FC = () => {
    const [data, setData] = useState<FamilyPlanningReport[]>([]);
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [selectedAgeCategory, setSelectedAgeCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                incrementLoading();
                const response = await fetch(
                    `${baseAPIUrl}/family-planning-reports`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();

                if (
                    result.status !== "success" ||
                    !Array.isArray(result.data)
                ) {
                    throw new TypeError("Expected data to be an array");
                }

                setData(result.data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        };

        fetchData();
    }, []);

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

    const reportColors = useMemo(() => {
        // Initialize color map for each report key
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
    
    const getDataset = (key: keyof FamilyPlanningReport, filteredData: FamilyPlanningReport[]) => ({
        label: capitalize(key.replace(/_/g, " ")),
        data: aggregateData(key, filteredData),
        fill: false,
        borderColor: reportColors[key as string],  // Use the key to get the color
        backgroundColor: reportColors[key as string],  // Use the key to get the color
        tension: 0.1,
    });
    
    const chartData = (filteredData: FamilyPlanningReport[]): ChartData<"line"> => ({
        labels,
        datasets: [
            getDataset("current_users_beginning_month", filteredData),
            getDataset("new_acceptors_prev_month", filteredData),
            getDataset("other_acceptors_present_month", filteredData),
            getDataset("drop_outs_present_month", filteredData),
            getDataset("current_users_end_month", filteredData),
            getDataset("new_acceptors_present_month", filteredData),
        ],
    });

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Family Planning Report'
            },
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
                        const methods: { [key: string]: number } = {};

                        const filteredData = data.filter(
                            (entry) => entry.age_category === selectedAgeCategory
                        );

                        filteredData.forEach((entry) => {
                            if (entry.report_period === reportPeriod) {
                                const key = tooltipItem.dataset.label
                                    .toLowerCase()
                                    .replace(/ /g, "_") as keyof FamilyPlanningReport;
                                if (typeof entry[key] === "number") {
                                    methods[entry.method_name] =
                                        (methods[entry.method_name] || 0) +
                                        entry[key];
                                }
                            }
                        });

                        const methodDetails = Object.entries(methods)
                            .map(([method, count]) => `${method}: ${count}`)
                            .join("\n");

                        return `\nMethods:\n${methodDetails}`;
                    },
                },
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
                    text: "Number of Users",
                },
            },
        },
    };

    const ageCategories = ["10-14", "15-19", "20-49"];

    const [maximizedCharts, setMaximizedCharts] = useState<{ [key: number]: boolean }>({});

    const toggleSize = (index: number) => {
        setMaximizedCharts((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return (
        <>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    {ageCategories.map((ageCategory, index) => {
                        const filteredData = data.filter(
                            (entry) => entry.age_category === ageCategory
                        );
                        const isMaximized = maximizedCharts[index];

                        return (
                            <div
                                key={index}
                                className={`chart p-4 bg-white rounded-lg ${
                                    isMaximized ? "w-full" : "w-9/12"
                                } transition-all relative`}
                            >
                                <h3 className="mb-2 font-semibold text-center">
                                    User of Family Planning Method for {ageCategory} years old
                                </h3>
                                <FontAwesomeIcon
                                    icon={isMaximized ? faMinimize : faMaximize}
                                    className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                                    onClick={() => toggleSize(index)}
                                />
                                <Line
                                    data={chartData(filteredData)}
                                    options={{
                                        ...options,
                                        plugins: {
                                            ...options.plugins,
                                            tooltip: {
                                                ...options.plugins.tooltip,
                                                callbacks: {
                                                    ...options.plugins.tooltip.callbacks,
                                                    afterLabel: (tooltipItem: any) => {
                                                        const reportPeriod = tooltipItem.label;
                                                        const methods: { [key: string]: number } = {};

                                                        filteredData.forEach((entry) => {
                                                            if (entry.report_period === reportPeriod) {
                                                                const key = tooltipItem.dataset.label
                                                                    .toLowerCase()
                                                                    .replace(/ /g, "_") as keyof FamilyPlanningReport;
                                                                if (typeof entry[key] === "number") {
                                                                    methods[entry.method_name] =
                                                                        (methods[entry.method_name] || 0) +
                                                                        entry[key];
                                                                }
                                                            }
                                                        });

                                                        const methodDetails = Object.entries(methods)
                                                            .map(([method, count]) => `${method}: ${count}`)
                                                            .join("\n");

                                                        return `\nMethods:\n${methodDetails}`;
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        );
                    })}
                </>
            )}
        </>
    );
};

export default FamilyPlanningChart;
