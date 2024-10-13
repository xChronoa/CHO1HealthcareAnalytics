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
import { useWra } from "../../../hooks/useWra"; // Adjust the path if necessary

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement
);

const ModernWRAChart: React.FC = () => {
    const { wraData, error, fetchWra } = useWra();

    useEffect(() => {
        fetchWra();
    }, [fetchWra]);

    const labels = Array.from(
        new Set(wraData.map((entry) => entry.report_period))
    );

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
        text
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

    const ageCategories = Array.from(new Set(wraData.map(entry => entry.age_category)));

    const generateColor = (): string => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    const ageColors = useMemo(() => {
        // Generate a unique color for each age category
        const colors: { [key: string]: string } = {};
        ageCategories.forEach((category) => {
            colors[category] = generateColor();
        });
        return colors;
    }, [ageCategories]);

    const chartData = (): ChartData<"line"> => ({
        labels,
        datasets: ageCategories.map((category) => ({
            label: capitalize(category),
            data: aggregateData(category),
            fill: false,
            borderColor: ageColors[category],  // Use the pre-generated color
            backgroundColor: ageColors[category],  // Use the pre-generated color
            tension: 0.1,
        })),
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
                },
            },
            legend: {
                position: "top",
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
                    text: "Number of Women of Reproductive Age",
                },
            },
        },
    };

    return (
        <>
            <div>
                {error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className="p-4 bg-white rounded-lg">
                        <h3 className="mb-2 font-semibold text-center">Unmet Need for Modern Family Planning</h3>
                        <Line
                            data={chartData()}
                            options={options}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default ModernWRAChart;
