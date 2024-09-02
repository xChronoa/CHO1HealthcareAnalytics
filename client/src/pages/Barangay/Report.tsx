import { useState } from "react";
import { M1Report } from "./M1Report";
import { MorbidityForm } from "./MorbidityForm";

const Report: React.FC = () => {
    const [section, setSection] = useState<string>("m1");

    const handleToggle = (selectedSection: string) => {
        setSection(selectedSection);
    };

    const getButtonClass = (currentSection: string) =>
        `shadow-md shadow-[#a3a19d] px-4 py-2 ${
            currentSection === section
                ? "bg-green text-white"
                : "bg-slate-200 text-black"
        }`;

    return (
        <>
            <div className="flex items-center justify-center transition-all toggle-sections">
                <button
                    onClick={() => handleToggle("m1")}
                    className={`${getButtonClass(
                        "m1"
                    )} rounded-tl-lg rounded-bl-lg`}
                >
                    M1 Data
                </button>
                <button
                    onClick={() => handleToggle("m2")}
                    className={`${getButtonClass(
                        "m2"
                    )} rounded-tr-lg rounded-br-lg`}
                >
                    M2 Data
                </button>
            </div>
            {section === "m1" && <M1Report />}
            {section === "m2" && <MorbidityForm />}
        </>
    );
};

export default Report;
