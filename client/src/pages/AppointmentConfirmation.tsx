import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AppointmentConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const [patientDetails, setPatientDetails] = useState(() => {
        const data = sessionStorage.getItem("appointmentDetails");
        return data ? JSON.parse(data) : null;
    });

    useEffect(() => {
        if (!patientDetails) {
            // Redirect to NotFound if no data is available
            navigate("/not-found", { replace: true });
        }
    }, [patientDetails, navigate]);

    if (!patientDetails) return null;

    return (
        <div className="flex flex-col items-center w-11/12 px-4 py-16 bg-white border-2 rounded-lg shadow-md sm:px-8 lg:w-1/2 justify-evenly">
            <h1 className="mb-6 text-3xl font-bold text-center text-thin">
                Appointment Confirmed
            </h1>
            <div className="w-full p-6 mb-4 rounded-lg shadow-inner bg-gray-50">
                <p className="flex flex-row justify-between mb-2 text-sm sm:text-md md:text-lg">
                    <strong className="font-semibold text-gray-700">
                        Full Name:
                    </strong>{" "}
                    {patientDetails.first_name} {patientDetails.last_name}
                </p>
                <p className="flex flex-row justify-between mb-2 text-sm sm:text-md md:text-lg">
                    <strong className="font-semibold text-gray-700">
                        Appointment Date:
                    </strong>{" "}
                    {new Date(
                        patientDetails.appointment_date
                    ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
                <p className="flex flex-row justify-between mb-2 text-sm sm:text-md md:text-lg">
                    <strong className="font-semibold text-gray-700">
                        Appointment Type:
                    </strong>{" "}
                    {patientDetails.appointment_category_name}
                </p>
                <p className="flex flex-row justify-between mb-2 text-sm sm:text-md md:text-lg">
                    <strong className="font-semibold text-gray-700">
                        Queue Number:
                    </strong>{" "}
                    {patientDetails.queue_number}
                </p>
                <p className="flex flex-row justify-between mb-2 text-sm sm:text-md md:text-lg">
                    <strong className="font-semibold text-gray-700">
                        Additional Notes:
                    </strong>{" "}
                    {patientDetails.patient_note || "None"}
                </p>
            </div>
            <button
                onClick={() => navigate("/appointment")}
                className="px-5 py-2.5 font-medium text-white bg-green rounded-lg shadow-gray-500 shadow-md hover:opacity-70 transition duration-200 ease-in-out"
            >
                Back to Home
            </button>
        </div>
    );
};

export default AppointmentConfirmation;
