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
import { baseAPIUrl } from "../../../config/apiConfig";
import FamilyPlanningChart from "./FamilyPlanningChart";
import ModernWRAChart from "./ModernWRAChart";
import { useLoading } from "../../../context/LoadingContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMaximize, faMinimize } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

interface ServiceData {
    service_data_id: number;
    service_id: number;
    indicator_name: string | null;
    age_category: string | null;
    barangay_name: string;
    report_period: string;
    value_type: string;
    value: number;
    remarks: string | null;
    service_name: string;
}

interface ServiceDataChartProps {
    chartRef: React.RefObject<HTMLDivElement>;
    textRef: React.RefObject<HTMLHeadingElement>;
    barangay: string;
    year: String | null;
}

const ServiceDataChart: React.FC<ServiceDataChartProps> = ({
    chartRef,
    textRef,
    barangay,
    year,
}) => {
    const [serviceData, setServiceData] = useState<ServiceData[]>([]);
    const [selectedService, setSelectedService] = useState<string>("Modern FP Unmet Need");
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const [services, setServices] = useState<string[]>([]);

    const capitalize = (text: string) =>
        text
            .toLowerCase()
            .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());

    useEffect(() => {
        const fetchServices = async () => {
            try {
                incrementLoading();
                const response = await fetch(`${baseAPIUrl}/services`, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (Array.isArray(result)) {
                    setServices(result.map((service: any) => service.service_name));
                } else {
                    throw new TypeError("Expected data to be an array");
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        };

        fetchServices();
    }, []);

    useEffect(() => {
        const fetchServiceData = async () => {
            if (!selectedService) return;

            if (selectedService === "Modern FP Unmet Need" || selectedService === "Family Planning") return;

            try {
                incrementLoading();
                const response = await fetch(
                    `${baseAPIUrl}/service-data-reports/${encodeURIComponent(encodeURIComponent(selectedService))}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ selectedService, barangay_name: barangay, year: year })
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (Array.isArray(result.data)) {
                    setServiceData(result.data);
                } else {
                    throw new TypeError("Expected data to be an array");
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                decrementLoading();
            }
        };

        fetchServiceData();
    }, [selectedService, barangay, year]);

    const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedService(event.target.value);
    };

    const filteredData = selectedService
        ? serviceData.filter((data) => data.service_name === selectedService)
        : serviceData;

    const labels = Array.from(
        new Set(filteredData.map((data) => data.report_period))
    );

    const indicatorColors = useMemo(() => {
        // Initialize disease color map once
        const colors: { [indicator_name: string]: string } = {};
        serviceData.forEach((entry) => {
            const indicatorKey = entry.indicator_name || "Unknown Indicator"; // Fallback to default key
            if (!colors[indicatorKey]) {
                colors[indicatorKey] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            }
        });
        return colors;
    }, [serviceData]);

    const aggregateDataByIndicator = (ageCategory: string | null, valueType: string | null) => {
        const indicators = Array.from(
            new Set(filteredData.map((data) => data.indicator_name))
        );
    
        return indicators.map((indicator) => {
            // Filter data correctly based on either ageCategory or valueType
            const dataForIndicator = filteredData.filter((data) => {
                if (ageCategory && !valueType) {
                    return data.indicator_name === indicator && data.age_category === ageCategory;
                } else if (!ageCategory && valueType) {
                    return data.indicator_name === indicator && data.value_type === valueType;
                }
                return false;
            });
    
            // Skip rendering if no data matches the condition
            if (!dataForIndicator.length) return null;
    
            return {
                label: indicator || "Unknown Indicator",
                data: labels.map((label) =>
                    dataForIndicator.reduce(
                        (total, data) =>
                            data.report_period === label ? total + data.value : total,
                        0
                    )
                ),
                fill: false,
                borderColor: indicatorColors[indicator || "Unknown Indicator"],
                backgroundColor: indicatorColors[indicator || "Unknown Indicator"],
                tension: 0.1,
            };
        }).filter(dataset => dataset !== null);  // Filter out null datasets
    };

    const [maximizedCharts, setMaximizedCharts] = useState<{ [key: string]: boolean }>({});
    
    const toggleSize = (chartId: string) => {
        setMaximizedCharts((prevState: { [key: string]: boolean }) => ({
            ...prevState,
            [chartId]: !prevState[chartId],
        }));
    };

    const renderCharts = () => {
        const hasAgeCategory = filteredData.some((data) => data.age_category);
        const hasValueType = filteredData.some((data) => data.value_type);

        if (selectedService === "Teenage Pregnancy") {
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );

            const datasets = ageCategories.map((ageCategory) => ({
                label: ageCategory || "Unknown Age Category",
                data: filteredData
                    .filter((data) => data.age_category === ageCategory)
                    .map((data) => data.value),
                borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                fill: false,
            }));

            const chartId = "teenage-pregnancy"; // Assign a unique id for this chart
            const isMaximized = maximizedCharts[chartId];

            return (
                <div className={`p-4 bg-white rounded-lg ${
                                    isMaximized ? "w-full" : "w-9/12"
                                } transition-all relative`}>
                    <h3 className="mb-2 font-medium text-center">Teenage Pregnancy</h3>
                    <FontAwesomeIcon
                        icon={isMaximized ? faMinimize : faMaximize}
                        className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                        onClick={() => toggleSize(chartId)}
                    />
                    <Line
                        data={{
                            labels,
                            datasets,
                        }}
                        options={options}
                    />
                </div>
            );
        }

        const renderedCategories = new Set();
        const renderedValueTypes = new Set();

        if (hasAgeCategory && hasValueType) {
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );
            const valueTypes = Array.from(
                new Set(filteredData.map((data) => data.value_type))
            );

            return (
                <>
                    {ageCategories.map((ageCategory) => {
                        if (renderedCategories.has(ageCategory)) return null;

                        const dataExistsForCategory = filteredData.some(
                            (data) => data.age_category === ageCategory && !data.value_type
                        );
                        if (!dataExistsForCategory) return null;

                        renderedCategories.add(ageCategory);
                        const chartId = `age-${ageCategory}`;
                        const isMaximized = maximizedCharts[chartId];

                        return (
                            <div key={ageCategory} className={`p-4 bg-white rounded-lg ${
                                    isMaximized ? "w-full" : "w-9/12"
                                } transition-all relative`}>
                                <h3 className="mb-2 font-semibold text-center">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                                <FontAwesomeIcon
                                    icon={isMaximized ? faMinimize : faMaximize}
                                    className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                                    onClick={() => toggleSize(chartId)}
                                />
                                <Line
                                    data={{
                                        labels,
                                        datasets: aggregateDataByIndicator(ageCategory, null),
                                    }}
                                    options={options}
                                />
                            </div>
                        );
                    })}

                    {valueTypes.map((valueType) => {
                        if (renderedValueTypes.has(valueType)) return null;

                        const dataExistsForType = filteredData.some(
                            (data) => data.value_type === valueType && !data.age_category
                        );
                        if (!dataExistsForType) return null;

                        renderedValueTypes.add(valueType);
                        const chartId = `value-${valueType}`;
                        const isMaximized = maximizedCharts[chartId];

                        return (
                            <div key={valueType} className={`p-4 bg-white rounded-lg ${
                                    isMaximized ? "w-full" : "w-9/12"
                                } transition-all relative`}>
                                <h3 className="mb-2 font-semibold text-center">{capitalize(valueType || "Unknown Value Type")}</h3>
                                <FontAwesomeIcon
                                    icon={isMaximized ? faMinimize : faMaximize}
                                    className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                                    onClick={() => toggleSize(chartId)}
                                />
                                <Line
                                    data={{
                                        labels,
                                        datasets: aggregateDataByIndicator(null, valueType),
                                    }}
                                    options={options}
                                />
                            </div>
                        );
                    })}
                </>
            );
        } else if (hasAgeCategory) {
            const ageCategories = Array.from(
                new Set(filteredData.map((data) => data.age_category))
            );

            return ageCategories.map((ageCategory) => {
                if (renderedCategories.has(ageCategory)) return null;

                renderedCategories.add(ageCategory);
                const chartId = `age-${ageCategory}`;
                const isMaximized = maximizedCharts[chartId];

                return (
                    <div key={ageCategory} className={`chart p-4 bg-white rounded-lg ${
                                    isMaximized ? "w-full" : "w-9/12"
                                } transition-all relative`}>
                        <h3 className="mb-2 font-semibold text-center">{"Age Range: " + ageCategory || "Unknown Age Category"}</h3>
                        <FontAwesomeIcon
                            icon={isMaximized ? faMinimize : faMaximize}
                            className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                            onClick={() => toggleSize(chartId)}
                        />
                        <Line
                            data={{
                                labels,
                                datasets: aggregateDataByIndicator(ageCategory, null),
                            }}
                            options={options}
                        />
                    </div>
                );
            });
        } else if (hasValueType) {
            const valueTypes = Array.from(
                new Set(filteredData.map((data) => data.value_type))
            );

            return valueTypes.map((valueType) => {
                if (renderedValueTypes.has(valueType)) return null;

                renderedValueTypes.add(valueType);
                const chartId = `value-${valueType}`;
                const isMaximized = maximizedCharts[chartId];

                return (
                    <div key={valueType} className={`chart p-4 bg-white rounded-lg ${
                                isMaximized ? "w-full" : "w-9/12"
                            } transition-all relative`}>
                        <h3 className="mb-2 font-semibold text-center">{capitalize(valueType || "Unknown Value Type")}</h3>
                        <FontAwesomeIcon
                            icon={isMaximized ? faMinimize : faMaximize}
                            className="absolute top-0 right-0 m-5 text-2xl transition-all cursor-pointer hover:text-green hover:scale-125"
                            onClick={() => toggleSize(chartId)}
                        />
                        <Line
                            data={{
                                labels,
                                datasets: aggregateDataByIndicator(null, valueType),
                            }}
                            options={options}
                        />
                    </div>
                );
            });
        }

        return <p>No data available for selected service.</p>;
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) =>
                        `Report Period: ${tooltipItems[0]?.label || "Unknown"}`,
                    label: (tooltipItem: any) =>
                        `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
                },
            },
            legend: {
                position: "bottom", // Ensure this matches one of the allowed values
                labels: {
                    textAlign: "left",
                    usePointStyle: true,
                    padding: 20,
                },
            },
        },
        layout: {
            padding: {
                right: 50,
            },
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
        <>
            <div>
                {error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex flex-row items-center justify-between w-9/12 gap-8 options">
                            <select
                                className="flex-1 w-full py-2 pl-2 rounded-lg lg:w-fit"
                                onChange={handleServiceChange}
                                value={selectedService}
                            >
                                <option hidden>Select a Service</option>
                                <option value="Modern FP Unmet Need">Modern FP Unmet Need</option>
                                <option value="Family Planning">Family Planning</option>
                                {services.map((service, index) => (
                                    <option key={index} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <section className="flex flex-col items-center justify-center w-full px-4 py-8 bg-almond" id="myChart" ref={chartRef}>
                            <h1 id="chart-title" className="w-9/12 p-2 text-2xl font-bold text-center text-white align-middle rounded-lg bg-green" ref={textRef}>{selectedService}</h1>
                            <div className="flex flex-col items-center justify-center w-full gap-8 charts">
                                {selectedService !== "Family Planning" ? (
                                    selectedService !== "Modern FP Unmet Need" ? (
                                        renderCharts()
                                    ) : (
                                        <ModernWRAChart barangay={barangay} year={year} />
                                    )
                                ) : (
                                    <FamilyPlanningChart barangay={barangay} year={year}/>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </>
    );
};

export default ServiceDataChart;
