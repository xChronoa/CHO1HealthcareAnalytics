import React, { useEffect, useState } from "react";
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
import { MorbidityReport, useMorbidityReport } from "../../../hooks/useMorbidityReport";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement
);

const MorbidityFormChart: React.FC = () => {
    const { loading, error, morbidityReports, fetchMorbidityReports } = useMorbidityReport();
    const [selectedAgeCategory, setSelectedAgeCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchMorbidityReports();
    }, [fetchMorbidityReports]);

    const labels = Array.from(new Set(morbidityReports.map((entry) => entry.report_period)));

    const aggregateDataByDisease = (key: 'male' | 'female') => {
        const aggregated: { [disease: string]: { [period: string]: number } } = {};
        const diseaseColors: { [disease: string]: string } = {};

        morbidityReports.forEach((entry) => {
            if (typeof entry[key] === "number") {
                if (!aggregated[entry.disease_name]) {
                    aggregated[entry.disease_name] = {};
                }
                if (!aggregated[entry.disease_name][entry.report_period]) {
                    aggregated[entry.disease_name][entry.report_period] = 0;
                }
                aggregated[entry.disease_name][entry.report_period] += entry[key];

                // Assign a color to each disease if not already assigned
                if (!diseaseColors[entry.disease_name]) {
                    diseaseColors[entry.disease_name] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                }
            }
        });

        return Object.entries(aggregated).map(([disease, periods]) => ({
            label: disease,
            data: labels.map((label) => periods[label] || 0),
            fill: false,
            borderColor: diseaseColors[disease], // Use the assigned color
            backgroundColor: diseaseColors[disease], // Use the same color for background
            tension: 0.1,
            gender: key
        }));
    };

    const getChartData = (key: 'male' | 'female') => ({
        labels,
        datasets: aggregateDataByDisease(key),
    });

    const options: ChartOptions<'line'> = {
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
                        const aggregatedByAgeCategory: { [age: string]: number } = {};
                    
                        // Extract gender from dataset label
                        const gender = tooltipItem.dataset.gender.toLowerCase() as 'male' | 'female';
                    
                        // Filter data based on the current report period, disease name, and gender
                        morbidityReports.forEach((entry) => {
                            if (entry.report_period === reportPeriod && entry.disease_name === diseaseName) {
                                if (!aggregatedByAgeCategory[entry.age_category]) {
                                    aggregatedByAgeCategory[entry.age_category] = 0;
                                }
                                // Aggregate values by age category based on gender
                                if (typeof entry[gender] === "number") {
                                    aggregatedByAgeCategory[entry.age_category] += entry[gender];
                                }
                            }
                        });
                    
                        // Format the output for the tooltip
                        const ageCategoryDetails = Object.entries(aggregatedByAgeCategory)
                            .map(([ageCategory, total]) => `${ageCategory}: ${total}`)
                            .join("\n");
                    
                        return `\nAge Categories:\n${ageCategoryDetails}`;
                    },
                },
            },
            legend: {
                position: "left",
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 10, // Adjust width of the legend box
                },
                align: 'start',
                
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Report Period",
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

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div className="flex flex-col gap-24">
                    <div>
                        <h3 className="font-semibold">Male Data</h3>
                        <Line
                            data={getChartData('male')}
                            options={options}
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold">Female Data</h3>
                        <Line
                            data={getChartData('female')}
                            options={options}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MorbidityFormChart;
