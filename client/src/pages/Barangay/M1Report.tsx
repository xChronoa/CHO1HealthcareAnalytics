import { useState } from "react";

// Report Components
import { ModernWRA } from "../../components/M1/ModernWRA";
import { FamilyPlanning } from "../../components/M1/FamilyPlanning";
import { PrenatalCare } from "../../components/M1/PrenatalCare";
import { IntrapartumCare } from "../../components/M1/IntrapartumCare";
import { PostpartumCare } from "../../components/M1/PostpartumCare";
import { ImmunizationServices } from "../../components/M1/ImmunizationServices";
import { NutritionServices } from "../../components/M1/NutritionServices";
import { NutritionalAssessment } from "../../components/M1/NutritionalAssessment";
import { DewormingServices } from "../../components/M1/DewormingServices";
import { SchoolBasedDeworming } from "../../components/M1/SchoolBasedDeworming";
import { SoilTransmitted } from "../../components/M1/SoilTransmitted";
import { Rabies } from "../../components/M1/Rabies";
import { Natality } from "../../components/M1/Natality";
import { ManagementOfSickChild } from "../../components/M1/ManagementOfSickChild";
import { NonCommunicableDisease } from "../../components/M1/NonCommunicableDisease";
import {
    FormData,
    FamilyPlanningEntry,
    ServiceData,
    WRA,
} from "../../types/M1FormData";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";

import "../../styles/m1form.css";

export const M1Report: React.FC = () => {
    const storedData = localStorage.getItem("m1formData");
    const initialFormData: FormData = storedData
        ? JSON.parse(storedData)
        : {
              wra: [
                  { age_category: "10-14", unmet_need_modern_fp: 0 },
                  { age_category: "15-19", unmet_need_modern_fp: 0 },
                  { age_category: "20-49", unmet_need_modern_fp: 0 },
              ],
              familyplanning: [],
              servicedata: [],
              teenagepregnancy: [],
          };
    const [formData, setFormData] = useState<FormData>(initialFormData);

    const [step, setStep] = useState<number>(() => {
        const savedStep = localStorage.getItem("step");
        return savedStep ? parseInt(savedStep, 10) || 1 : 1;
    });

    const totalSteps = 16;
    const handleNextStep = () => {
        setStep((prevStep) => {
            if (prevStep === 0) {
                return Math.min(prevStep + 2, totalSteps);
            }

            const newStep = Math.min(prevStep + 1, totalSteps);
            localStorage.setItem("step", JSON.stringify(newStep));
            return newStep;
        }); // Adjust max step count here
    };

    const handlePreviousStep = () => {
        setStep((prevStep) => {
            const newStep = Math.max(prevStep - 1, 1);
            localStorage.setItem("step", JSON.stringify(newStep));
            return newStep;
        }); // Start from step 1
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    useEffectAfterMount(() => {
        localStorage.setItem("m1formData", JSON.stringify(formData));
    }, [formData]);

    const updateWRAData = (
        index: number,
        field: keyof FormData["wra"][number],
        value: any
    ) => {
        setFormData((prevData) => {
            const updatedWRA = prevData.wra.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            );
            return { ...prevData, wra: updatedWRA };
        });
    };

    const updateFamilyPlanningData = (
        ageCategory: string,
        fpMethodId: number,
        fpMethodName: string,
        field: keyof FamilyPlanningEntry,
        value: any
    ) => {
        setFormData((prevData) => {
            const existingIndex = prevData.familyplanning.findIndex(
                (item) =>
                    item.age_category === ageCategory &&
                    item.fp_method_id === fpMethodId
            );

            let updatedFamilyPlanning: FamilyPlanningEntry[];

            if (existingIndex > -1) {
                // Update existing entry
                updatedFamilyPlanning = prevData.familyplanning.map((item, i) =>
                    i === existingIndex ? { ...item, [field]: value } : item
                );
            } else {
                // Add new entry
                updatedFamilyPlanning = [
                    ...prevData.familyplanning,
                    {
                        age_category: ageCategory,
                        fp_method_id: fpMethodId,
                        fp_method_name: fpMethodName, // Provide a default or empty value
                        current_users_beginning_month: 0,
                        new_acceptors_prev_month: 0,
                        other_acceptors_present_month: 0,
                        drop_outs_present_month: 0,
                        current_users_end_month: 0,
                        new_acceptors_present_month: 0,
                        [field]: value,
                    },
                ];
            }

            return { ...prevData, familyplanning: updatedFamilyPlanning };
        });
    };

    const updateServiceData = (
        serviceId: number,
        indicatorId: number | undefined,
        ageCategory: string | undefined,
        valueType: string | undefined,
        field: keyof ServiceData,
        value: any
    ) => {
        setFormData((prevData) => {
            // Find the existing index with optional parameters
            const existingIndex = prevData.servicedata.findIndex(
                (item) =>
                    item.service_id === serviceId &&
                    (indicatorId === undefined ||
                        item.indicator_id === indicatorId) &&
                    (ageCategory === undefined ||
                        item.age_category === ageCategory) &&
                    (valueType === undefined || item.value_type === valueType)
            );

            let updatedServices: ServiceData[];

            if (existingIndex > -1) {
                // Update existing entry
                updatedServices = prevData.servicedata.map((item, i) =>
                    i === existingIndex ? { ...item, [field]: value } : item
                );
            } else {
                // Add new entry with default values if optional fields are missing
                updatedServices = [
                    ...prevData.servicedata,
                    {
                        service_id: serviceId,
                        indicator_id: indicatorId,
                        age_category: ageCategory ?? "",
                        value_type: valueType ?? "",
                        value: field === "value" ? value : 0, // Initialize `value` to 0 if it's not being updated
                        remarks: field === "remarks" ? value : "", // Initialize `remarks` to an empty string if it's not being updated
                    } as ServiceData, // Ensure the new entry conforms to the `ServiceData` type
                ];
            }

            return { ...prevData, servicedata: updatedServices };
        });
    };

    const handleClick = async () => {
        // console.log(JSON.stringify(formData));
        console.log(JSON.stringify(sortFormData(formData)));
        // localStorage.removeItem("formData");
        try {
            const response = await fetch(
                "http://localhost:8000/api/submit/report",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(sortFormData(formData)),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const data = await response.json();
            console.log(data);
        } catch (error: any) {
            console.log(error);
        }
    };

    /**
     * Sorts the given form data in place based on specified criteria.
     *
     * @param data - The form data to be sorted in place.
     */
    function sortFormData(data: FormData): Object {
        // Helper function to compare ServiceData items
        function compareServiceData(a: ServiceData, b: ServiceData): number {
            if (a.service_id !== b.service_id) {
                return a.service_id - b.service_id;
            }
            if ((a.indicator_id ?? 0) !== (b.indicator_id ?? 0)) {
                return (a.indicator_id ?? 0) - (b.indicator_id ?? 0);
            }
            return (a.age_category ?? "").localeCompare(b.age_category ?? "");
        }

        // Helper function to compare FamilyPlanningEntry items
        function compareFamilyPlanning(
            a: FamilyPlanningEntry,
            b: FamilyPlanningEntry
        ): number {
            if (a.fp_method_id !== b.fp_method_id) {
                return a.fp_method_id - b.fp_method_id;
            }
            return a.age_category.localeCompare(b.age_category);
        }

        // Helper function to compare WRA items
        function compareWRA(a: WRA, b: WRA): number {
            return a.age_category.localeCompare(b.age_category);
        }

        // Helper function to compare TeenagePregnancy items
        function compareTeenagePregnancy(
            a: { service_id: number; age_category: string },
            b: { service_id: number; age_category: string }
        ): number {
            if (a.service_id !== b.service_id) {
                return a.service_id - b.service_id;
            }
            return a.age_category.localeCompare(b.age_category);
        }

        console.log({
            wra: data.wra.sort(compareWRA).length,
            familyplanning: data.familyplanning.sort(compareFamilyPlanning).length,
            servicedata: data.servicedata.sort(compareServiceData).length,
            teenagepregnancy: data.teenagepregnancy.sort(
                compareTeenagePregnancy
            ).length,
        })

        // Sort the arrays in place
        return {
            wra: data.wra.sort(compareWRA),
            familyplanning: data.familyplanning.sort(compareFamilyPlanning),
            servicedata: data.servicedata.sort(compareServiceData),
            teenagepregnancy: data.teenagepregnancy.sort(
                compareTeenagePregnancy
            ),
        };
    }

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="w-full mb-4">
                    <h1 className="mb-2 text-2xl font-bold">M1 Report</h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>

                {/* Progress Bar */}
                <div className="relative mb-6">
                    <div className="flex items-center mb-2">
                        {[...Array(totalSteps)].map((_, index) => (
                            <div
                                key={index}
                                className="relative flex items-center flex-1"
                            >
                                {/* Circle */}
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center absolute -left-3 ${
                                        step > index
                                            ? "bg-green"
                                            : "bg-gray-300"
                                    } transition-colors duration-300`}
                                    style={{ zIndex: 1 }}
                                >
                                    <span className="text-white">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div
                                    className={`flex-1 h-1 ${
                                        index < totalSteps - 1
                                            ? "bg-gray-300"
                                            : ""
                                    } ${
                                        step > index ? "bg-green" : ""
                                    } transition-colors duration-300`}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Filled Progress Bar */}
                    <div
                        className="absolute top-0 left-0 h-1 bg-green"
                        style={{
                            width: `${(step / totalSteps) * 100}%`,
                            zIndex: 0,
                        }}
                    />
                </div>

                <div
                    className={`w-full navigation-buttons flex ${
                        step !== 1 ? "justify-between" : "justify-end"
                    } mt-6 sticky`}
                >
                    {step !== 1 ? (
                        <button
                            className="px-5 py-2 text-white transition-all rounded cursor-pointer hover:opacity-75 bg-green"
                            onClick={handlePreviousStep}
                            disabled={step === 1}
                        >
                            Previous
                        </button>
                    ) : null}
                    {step !== totalSteps ? (
                        <button
                            className="px-5 py-2 text-white transition-all rounded cursor-pointer hover:opacity-75 bg-green"
                            onClick={handleNextStep}
                            disabled={step === totalSteps} // Adjust based on the max step
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            className="px-5 py-2 text-white transition-all bg-blue-500 rounded cursor-pointer hover:opacity-75"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    )}
                </div>

                <button
                    className="w-full px-4 py-2 m-5 ml-0 font-bold text-white transition-all bg-red-500 rounded-lg shadow-md active:scale-[98%] hover:bg-red-600 shadow-gray-500"
                    onClick={handleClick}
                >
                    CONSOLE
                </button>

                <section>
                    <form
                        onSubmit={handleClick}
                        className="flex flex-col items-center justify-center gap-5"
                    >
                        {(step || 0) === 1 && (
                            <ModernWRA
                                data={formData.wra}
                                updateData={(index, field, value) =>
                                    updateWRAData(index, field, value)
                                }
                            />
                        )}
                        {step === 2 && (
                            <FamilyPlanning
                                data={formData}
                                updateFamilyPlanningData={
                                    updateFamilyPlanningData
                                }
                            />
                        )}
                        {step === 3 && (
                            <PrenatalCare
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 4 && (
                            <IntrapartumCare
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 5 && (
                            <PostpartumCare
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 6 && (
                            <ImmunizationServices
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 7 && (
                            <NutritionServices
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 8 && (
                            <NutritionalAssessment
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 9 && (
                            <DewormingServices
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 10 && (
                            <SchoolBasedDeworming
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 11 && (
                            <SoilTransmitted
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 12 && (
                            <Rabies
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 13 && (
                            <Natality
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 14 && (
                            <ManagementOfSickChild
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        {step === 15 && (
                            <NonCommunicableDisease
                                formData={formData}
                                updateServiceData={updateServiceData}
                            />
                        )}
                        <button className="w-full px-4 py-2 m-5 ml-0 font-bold text-white transition-all bg-red-500 rounded-lg shadow-md active:scale-[98%] hover:bg-red-600 shadow-gray-500">
                            SUBMIT
                        </button>
                    </form>
                </section>

                {/* Previous position of nav buttons */}
                {/* Navigation Buttons */}
            </div>
        </>
    );
};
