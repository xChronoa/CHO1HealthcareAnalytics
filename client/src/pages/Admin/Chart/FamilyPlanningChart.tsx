import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FamilyPlanningChart = () => {
    const data1 = {
        labels: ['10', '11', '12', '13', '14'],
        datasets: [
            {
                label: 'Number of users',
                data: [2, 3, 1, 2, 1],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const data2 = {
        labels: ['15', '16', '17', '18', '19'],
        datasets: [
            {
                label: 'Number of users',
                data: [3, 4, 5, 4, 5],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    const data3 = {
        labels: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'],
        datasets: [
            {
                label: 'Number of users',
                data: [4, 3, 5, 6, 4, 5, 3, 4, 5, 6, 4, 5, 6, 4, 5, 7, 5, 6, 4, 5, 6, 5, 6, 7, 5, 6, 8, 7, 6],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const }, // Cast it as a literal type
            title: { display: true, text: 'Family Planning Data' }
        }
    };

    return (
        <div className="w-11/12 py-16 mx-auto">
            <div className="my-8">
                <h3 className="mb-4 text-lg font-semibold text-center">User of Family Planning Method for 10-14 years old:</h3>
                <Bar data={data1} options={options} />
            </div>
            <div className="my-8">
                <h3 className="mb-4 text-lg font-semibold text-center">User of Family Planning Method for 15-19 years old:</h3>
                <Bar data={data2} options={options} />
            </div>
            <div className="my-8">
                <h3 className="mb-4 text-lg font-semibold text-center">User of Family Planning Method for 20-49 years old:</h3>
                <Bar data={data3} options={options} />
            </div>
        </div>
    );
};

export default FamilyPlanningChart;
