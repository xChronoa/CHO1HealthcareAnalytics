import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AppointmentConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const [patientDetails] = useState(() => {
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
        <section className="container flex flex-col items-center justify-center w-full h-full transition-all wrapper">
            <div className="flex flex-col items-center justify-center w-11/12 h-full min-h-screen px-2 py-12 bg-white border-2 rounded-lg shadow-md sm:px-8 lg:w-1/2">
                <h1 className="mb-6 text-lg font-bold text-center text-gray-800 md:text-3xl">
                    Appointment Successfully Booked
                </h1>

                <p className="mb-6 text-xs text-center text-gray-600 sm:text-base">
                    Your appointment has been successfully scheduled. A confirmation email containing the appointment details has been sent to your inbox.
                </p>

                <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-3 w-full text-xs sm:text-sm md:text-base p-2 py-4 sm:p-6 mb-4 rounded-lg shadow-inner bg-gray-50 justify-center items-center">
                    <span className="font-semibold text-right text-gray-700">Full Name:</span>
                    <span className="text-left">{patientDetails.first_name} {patientDetails.last_name}</span>

                    <span className="font-semibold text-right text-gray-700">Appointment Date:</span>
                    <span className="text-left">{new Date(patientDetails.appointment_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>

                    <span className="font-semibold text-right text-gray-700">Appointment Type:</span>
                    <span className="text-left">{patientDetails.appointment_category_name}</span>

                    <span className="font-semibold text-right text-gray-700">Queue Number:</span>
                    <span className="text-left">{patientDetails.queue_number}</span>

                    <span className="font-semibold text-right text-gray-700">Additional Notes:</span>
                    <span className="text-left break-words">{patientDetails.patient_note || "None"}</span>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="text-sm sm:text-base px-5 py-2.5 font-medium text-white bg-green rounded-lg shadow-gray-500 shadow-md hover:opacity-70 transition duration-200 ease-in-out"
                >
                    Back to Home
                </button>
            </div>
        </section>
    );
};

export default AppointmentConfirmation;
