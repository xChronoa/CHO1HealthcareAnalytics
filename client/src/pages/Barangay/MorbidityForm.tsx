import {
    faCaretUp,
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons/faCaretDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Disease, useDisease } from "../../hooks/useDisease";
import { useAgeCategory } from "../../hooks/useAgeCategory";
import { IncompleteUpdate } from "../../types/IncompleteForm";
import { InputValues } from "../../types/M2FormData";
import Swal from "sweetalert2";
import "../../styles/form.css";

interface M2ReportProps {
    setReportDatas: (type: 'm1' | 'm2', data: any) => void;
    onCheckIncomplete: IncompleteUpdate;
    diseases: Disease[];
}

export const MorbidityForm: React.FC<M2ReportProps> = ({
    setReportDatas,
    onCheckIncomplete,
}) => {
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [incompleteDiseases, setIncompleteDiseases] = useState<string[]>([]);
    
    const [formData, setFormData] = useState<InputValues>(initializeFormData());
    const { diseases, fetchDiseases } = useDisease();
    const { ageCategories, fetchAgeCategories } = useAgeCategory();

    // Initialize form data from local storage or default to an empty object
    function initializeFormData(): InputValues {
        const storedData = localStorage.getItem("m2formData");
        return storedData ? JSON.parse(storedData) : {};
    }

    // Toggle visibility of sections based on disease
    const toggleSection = (disease: string) => {
        setOpenSections(prevSections =>
            prevSections.includes(disease)
                ? prevSections.filter(section => section !== disease)
                : [...prevSections, disease]
        );
    };

    // Update form data based on user input
    const handleInputChange = (
        disease: string,
        ageCategory: string,
        gender: "M" | "F",
        value: number | string
    ) => {
        // Check if the value is empty to clear the field
        const newValue = value === "" ? undefined : Number(value);

        // Only proceed if the new value is valid (non-negative and an integer)
        if (newValue === undefined || (newValue >= 0 && Number.isInteger(newValue))) {
            setFormData(prevValues => ({
                ...prevValues,
                [disease]: {
                    ...prevValues[disease],
                    [ageCategory]: {
                        ...prevValues[disease]?.[ageCategory],
                        [gender]: newValue,
                    },
                },
            }));
        }
    };

    // Check if all required fields for a disease are complete
    const isComplete = (disease: string): boolean => {
        const values = formData[disease];
        if (!values) return false;

        return ageCategories.every(group => {
            const maleValue = values[group.age_category]?.M;
            const femaleValue = values[group.age_category]?.F;

            // Helper function to determine if a value is valid
            const isValid = (value: string | number | undefined | null): boolean => {
                if (typeof value === "string") {
                    return value.trim() !== "";
                }
                if (typeof value === "number") {
                    // Ensure the value is a non-negative integer
                    return value >= 0 && Number.isInteger(value);
                }
                return false;
            };

            return isValid(maleValue) && isValid(femaleValue);
        });
    };

    // Fetch initial data on component mount
    useEffect(() => {
        fetchAgeCategories();
        fetchDiseases();
    }, [fetchAgeCategories, fetchDiseases]);

    // Update local storage and data on formData change
    useEffect(() => {
        setReportDatas('m2', formData);
        localStorage.setItem("m2formData", JSON.stringify(formData));
    }, [formData]);

    // Update incomplete diseases state
    useEffect(() => {
        const newIncompleteDiseases = diseases
            .filter(disease => !isComplete(disease.disease_name))
            .map(disease => disease.disease_name);

        setIncompleteDiseases(newIncompleteDiseases);
    }, [diseases, formData]);

    // Notify external system of incomplete diseases
    useEffect(() => {
        onCheckIncomplete("M2", incompleteDiseases);
    }, [incompleteDiseases]);

    useEffect(() => {
        // Check if the user has already dismissed the alert in the current session
        if (sessionStorage.getItem("morbidityFormAlertDismissed") === "true") {
            return; // Exit early if the user has already dismissed the alert
        }
    
        Swal.fire({
            icon: "info", // Informational icon
            title: "Please Verify Your Details",
            html: `
                <div class="text-lg font-medium">
                    <p class="mb-4">Before you begin entering your details, please take a moment to review the instructions and ensure all your information is correct. You will be able to review everything before submitting your form.</p>
                    <p class="text-sm text-gray-600">
                        <strong>Important:</strong> The system is not responsible for any inaccuracies in the details you provide. You confirm that the information you enter is accurate and complete to the best of your knowledge.
                    </p>
                    <p class="mt-4 text-sm text-gray-500">
                        Once you submit the form, you will not be able to make any changes to the details. Please ensure everything is correct before final submission.
                    </p>
                </div>
            `,
            confirmButtonText: "I confirm, don't show again.",
            cancelButtonText: "I confirm, proceed",
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                title: "text-xl font-bold text-gray-800",
                htmlContainer: "text-gray-700",
                popup: "p-4 text-center",
                confirmButton:
                    "transition-all bg-green text-white px-4 py-2 rounded-md hover:bg-[#009900]",
                cancelButton:
                    "transition-all bg-white border-black border-[1px] ml-2 text-black px-4 py-2 rounded-md hover:bg-gray-200",
            },
            buttonsStyling: false,
            scrollbarPadding: false,
        }).then((result) => {
            if (result.isConfirmed) {
                // If the user clicked "Don't Show Again", set flag in sessionStorage
                sessionStorage.setItem("morbidityFormAlertDismissed", "true");
            }
        });
    }, []);

    return (
        <section className="flex flex-col items-center justify-center w-11/12 pt-16">
            <header className="w-full mb-4">
                <h1 className="mb-2 text-2xl font-bold">M2 Report <span className="italic font-light">(Morbidity Diseases)</span></h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>

            <div className="w-full lg:p-4 lg:w-4/5">
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
                {diseases.map((disease) => (
                    <div key={disease.disease_code} className="mb-4 shadow-sm disease shadow-gray-500">
                        <button
                            type="button"
                            onClick={() => toggleSection(disease.disease_name)}
                            className="relative flex flex-col items-center w-full gap-2 py-3 text-left transition-all bg-white group"
                        >
                            <div className="flex flex-row items-center w-full gap-2 px-4 text-left transition-all bg-white group">
                                <span className="flex-[2_2_0%] disease-name">
                                    {disease.disease_name}
                                </span>
                                &nbsp;
                                <span className="flex-[1_1_0%] disease-code">
                                    {disease.disease_code}
                                </span>
                                {isComplete(disease.disease_name) ? (
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

                            <div className="bg-white items-center justify-centerbottom-[-1.2rem] left-[50%] h-4 transition-all">
                                <FontAwesomeIcon
                                    icon={
                                        openSections.includes(
                                            disease.disease_name
                                        )
                                            ? faCaretUp
                                            : faCaretDown
                                    }
                                    className="transition-all origin-top scale-95"
                                />
                            </div>
                        </button>

                        {openSections.includes(disease.disease_name) && (
                            <div className="p-4 text-xs bg-gray-100 sm:text-sm">
                                <div className="grid grid-cols-3 gap-2 mb-2 font-bold text-center uppercase">
                                    <h3 className="w-full border-b-2 border-black">Age Range</h3>
                                    <h3 className="w-full border-b-2 border-black required-label-after">Male</h3>
                                    <h3 className="w-full border-b-2 border-black required-label-after">Female</h3>
                                </div>
                                {ageCategories.map((category) => (
                                    <div
                                        key={category.age_category_id}
                                        className="grid items-center grid-cols-3 gap-2 mb-2"
                                    >
                                        <label className="w-full required-label-after">
                                            {category.age_category}:
                                        </label>
                                        <input
                                            type="number"
                                            name={`${disease.disease_name}_${category.age_category}_M`}
                                            className="w-full px-2 py-1 mx-1 my-1"
                                            value={
                                                formData[
                                                    disease.disease_name
                                                ]?.[category.age_category]?.M ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    disease.disease_name,
                                                    category.age_category,
                                                    "M",
                                                    e.target.value
                                                )
                                            }
                                            min={0}
                                            placeholder={"# of Male"}
                                            required
                                        />
                                        <input
                                            type="number"
                                            name={`${disease.disease_name}_${category.age_category}_F`}
                                            className="w-full px-2 py-1 mx-1 my-1"
                                            value={
                                                formData[
                                                    disease.disease_name
                                                ]?.[category.age_category]?.F ??
                                                ""
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    disease.disease_name,
                                                    category.age_category,
                                                    "F",
                                                    e.target.value
                                                )
                                            }
                                            min={0}
                                            placeholder={"# of Female"}
                                            required
                                        />
                                    </div>
                                ))}

                                {/* Calculate and display Total */}
                                <div className="grid items-center grid-cols-3 gap-2 mb-2 font-bold border-black border-y-2">
                                    <span className="w-full font-bold uppercase">Total:</span>
                                    <span className="w-full px-2 py-1 mx-1 my-1">
                                        {ageCategories.reduce((sum, category) => {
                                            const maleValue = 
                                                parseInt(String(formData[disease.disease_name]?.[category.age_category]?.M ?? 0), 10);
                                            return sum + (isNaN(maleValue) ? 0 : maleValue);
                                        }, 0) ?? 0}
                                    </span>
                                    <span className="w-full px-2 py-1 mx-1 my-1">
                                        {ageCategories.reduce((sum, category) => {
                                            const femaleValue = 
                                                parseInt(String(formData[disease.disease_name]?.[category.age_category]?.F ?? 0), 10);
                                            return sum + (isNaN(femaleValue) ? 0 : femaleValue);
                                        }, 0) ?? 0}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};
