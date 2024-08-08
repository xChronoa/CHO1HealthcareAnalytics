import {
    faCaretUp,
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons/faCaretDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

// Define the shape of the disease data and input values.
interface Disease {
    name: string; // Name of the disease
    code: string; // ICD code for the disease
}

interface AgeGroup {
    [key: string]: { M: number; F: number }; // Represents counts of males (M) and females (F) for each age group
}

interface InputValues {
    [key: string]: AgeGroup; // Maps each disease to its associated age groups
}

export const MorbidityForm: React.FC = () => {
    // Initialize state variables using useState Hook
    const [openSections, setOpenSections] = useState<string[]>([]); // Tracks which sections are open
    const [inputValues, setInputValues] = useState<InputValues>({}); // Stores input values

    // Static list of diseases with their corresponding ICD codes
    const diseases: Disease[] = [
        { name: "ABSCESS", code: "L02.9" },
        { name: "ACUTE RHINITIS (COLDS)", code: "J00" },
        { name: "AGE", code: "A09" },
        { name: "ANIMAL BITE", code: "" },
        { name: "ARTHRITIS", code: "M13.99" },
        { name: "ASTHMA", code: "J45.9" },
        { name: "CONJUNCTIVITIS", code: "H10" },
        { name: "COSTOCHONDRITIS", code: "M94.08" },
        { name: "DISLIPIDEMIA", code: "E78.9" },
        { name: "EAR INFECTION", code: "H66.9" },
        { name: "FOOD ALLERGY", code: "T78.1" },
        { name: "GASTRITIS", code: "K29.7" },
        { name: "HEADACHE", code: "R51" },
        { name: "HERPES ZOSTER", code: "B02.9" },
        { name: "HYPERTENSION", code: "I10.9" },
        { name: "INFLUENZA-LIKE ILLNESS", code: "A49.2" },
        { name: "UTI (Urinary Tract Infection)", code: "N39.0" },
        { name: "FEVER", code: "R50" },
        { name: "SVI (Systematic Viral Infection)", code: "B34.9" },
        { name: "PTB (Pulmonary TB)", code: "A15.3" },
        { name: "SCABIES", code: "B86" },
        { name: "SKIN ALLERGY", code: "L23.9" },
        { name: "URTI", code: "J06.9" },
        { name: "ALLERGY", code: "T78.4" },
        { name: "ATP (Acute Tonsillo Pharyngitis)", code: "J06.8" },
        { name: "WOUND", code: "T01.9" },
        { name: "VERTIGO (DIZZINESS)", code: "R42" },
        { name: "DIARRHEA", code: "K52.9" },
    ];

    // List of age groups for which data is collected
    const ageGroup: string[] = [
        "0-6 days",
        "7-28 days",
        "29d-11mos",
        "1-4",
        "5-9",
        "10-14",
        "15-19",
        "20-24",
        "25-29",
        "30-34",
        "35-39",
        "40-44",
        "45-49",
        "50-54",
        "55-59",
        "60-64",
        "65-69",
        "70+",
    ];

    // Toggles the visibility of the accordion section for a specific disease
    const toggleSection = (disease: string) => {
        setOpenSections((prevSections) =>
            prevSections.includes(disease)
                ? prevSections.filter((section) => section !== disease)
                : [...prevSections, disease]
        );
    };

    // Updates the input values in the component state
    const handleInputChange = (
        disease: string,
        ageGroup: string,
        gender: "M" | "F",
        value: number
    ) => {
        setInputValues((prevValues) => ({
            ...prevValues,
            [disease]: {
                ...prevValues[disease],
                [ageGroup]: {
                    ...prevValues[disease]?.[ageGroup],
                    [gender]: value,
                },
            },
        }));
    };

    const isComplete = (disease: string): boolean => {
        const values = inputValues[disease];
        if (!values) return false;
        console.log(values);

        return ageGroup.every(
            (group) =>
                values[group]?.M !== undefined &&
                values[group]?.F !== undefined
        );
    };

    return (
        <>
            <h2 className="font-bold uppercase text-[1.2rem] md:text-[1.5rem] my-4 mt-10 transition-all">
                Morbidity Disease Report
            </h2>

            <form className="w-full p-4 pb-16 md:w-4/5">
                {/* Column headers */}
                <div className="flex flex-row w-full text-center border-white bg-green text-white italic [&>*]:px-4 [&>*]:py-2 rounded-tl-xl rounded-tr-xl font-medium uppercase text-sm md:text-[1.1rem]">
                    <h3 className="flex-[2_2_0] border-r-2 flex justify-left items-center">
                        Disease
                    </h3>
                    <h3 className="flex items-center justify-center flex-1 sm:flex-[.6_.6_0%] sm:items-start sm:justify-start border-r-2 border-white text-nowrap">
                        ICD 10
                        <br />
                        Code
                    </h3>
                    <h3 className="flex-[.7_.7_0%] sm:flex-[.5_.5_0%] flex justify-center items-center">
                        Status
                    </h3>
                </div>
                {/* Render sections for each disease */}
                {diseases.map((disease) => (
                    <div key={disease.code} className="mb-4 disease">
                        {/* Button to toggle the display of the disease's accordion section */}
                        <button
                            type="button"
                            onClick={() => toggleSection(disease.name)}
                            className="relative flex flex-col items-center w-full gap-2 py-3 text-left transition-all bg-white group"
                            data-tooltip-target="tooltip-pending"
                        >
                            <div className="flex flex-row items-center w-full gap-2 px-4 text-left transition-all bg-white group">
                                <span className="flex-[2_2_0%] disease-name">
                                    {disease.name}
                                </span>
                                &nbsp;
                                <span className="flex-[1_1_0%] disease-code">
                                    {disease.code}
                                </span>
                                {/* Display icons for success and pending states */}
                                {isComplete(disease.name) ? (
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        style={{ color: "#39ca12" }}
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faExclamationCircle}
                                        style={{ color: "#FFD43B" }}
                                    />
                                )}
                            </div>
                            
                            {/* Expand/Collapse icon */}
                            <div className="bg-white items-center justify-center h-0 bottom-[-1.2rem] left-[50%] group-focus-within:h-4 group-hover:h-4 group-focus-visible:h-4 transition-all">
                                <FontAwesomeIcon
                                    icon={
                                        openSections.includes(disease.name)
                                            ? faCaretUp
                                            : faCaretDown
                                    }
                                    className="transition-all origin-top scale-0 group-hover:scale-95 group-focus-visible:scale-95 group-focus-within:scale-95 group-open:scale-95"
                                />
                            </div>
                        </button>

                        {/* Conditionally render the input fields based on section visibility */}
                        {openSections.includes(disease.name) && (
                            <div className="p-4 bg-gray-100">
                                <div className="flex flex-row mb-2 text-center">
                                    <div className="w-full md:w-1/3"></div>
                                    <h3 className="w-full md:w-1/6">Male</h3>
                                    <h3 className="w-full md:w-1/6">Female</h3>
                                </div>
                                {/* Input fields for each age group */}
                                {ageGroup.map((group) => (
                                    <div
                                        key={group}
                                        className="flex flex-row mb-2"
                                    >
                                        <label className="w-full md:w-1/3">
                                            {group}:
                                        </label>
                                        <input
                                            type="number"
                                            name={`${disease.name}_${group}_M`}
                                            className="w-full px-2 py-1 mx-1 my-1 md:w-1/6"
                                            value={
                                                inputValues[disease.name]?.[
                                                    group
                                                ]?.M || ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    disease.name,
                                                    group,
                                                    "M",
                                                    Number(e.target.value)
                                                )
                                            }
                                            min={0}
                                            placeholder={"# of Male"}
                                            required
                                        />
                                        <input
                                            type="number"
                                            name={`${disease.name}_${group}_F`}
                                            className="w-full px-2 py-1 mx-1 my-1 md:w-1/6"
                                            value={
                                                inputValues[disease.name]?.[
                                                    group
                                                ]?.F || ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    disease.name,
                                                    group,
                                                    "F",
                                                    Number(e.target.value)
                                                )
                                            }
                                            placeholder={"# of Female"}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    className="w-full px-4 py-2 mt-4 text-white transition-all rounded bg-green hover:opacity-85 active:scale-[98%]"
                >
                    Submit
                </button>
            </form>
        </>
    );
};

// Issues
// The form will accept submitting with the sections minimized despite the sections having incomplete/pending fields.
// Input fields does not allow typing number "0".
// Section status should update based on if the user has inputted a value or not.  