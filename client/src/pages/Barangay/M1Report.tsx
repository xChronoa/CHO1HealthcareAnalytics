import { useEffect, useState } from "react";

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
import { useServices } from "../../hooks/useServices";
import { TeenagePregnancy } from "../../components/M1/TeenagePregnancy";
import {
    updateWRAData,
    updateFamilyPlanningData,
    updateServiceData,
} from "../../utils/m1FormDataUtils";
import { IncompleteUpdate } from "../../types/IncompleteForm";

interface M1ReportProps {
    setReportDatas: (type: "m1" | "m2", data: any) => void;
    onCheckIncomplete: IncompleteUpdate;
}

export const M1Report: React.FC<M1ReportProps> = ({
    setReportDatas,
    onCheckIncomplete,
}) => {
    const storedData = localStorage.getItem("m1formData");
    const { services, fetchServices } = useServices();

    const initialFormData: FormData = storedData
        ? JSON.parse(storedData)
        : {
              wra: [],
              familyplanning: [],
              servicedata: [],
          };

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [incompleteSections, setIncompleteSections] = useState<string[]>([]);

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

    // Expected counts for each service ID
    const serviceExpectedCounts: Record<number, number> = {
        1: 57, // Prenatal
        2: 33, // Intrapartum
        3: 9, // Post-partum
        4: 50, // Immunization
        5: 18, // Nutrition Services
        6: 26, // Nutritional Assessment
        7: 6, // Deworming
        8: 6, // School-based Deworming
        9: 1, // Soil
        10: 4, // Rabies
        11: 4, // Natality
        12: 18, // Management
        13: 24, // Non-communicable Diseases
        14: 9, // Teenage Pregnancy
    };

    // Validate WRA section
    const isWRAComplete = (wra: WRA[]): boolean => {
        return wra.every((entry) => {
            return (
                entry.unmet_need_modern_fp !== undefined &&
                entry.unmet_need_modern_fp >= 0 // Non-negative number
            );
        });
    };

    // Validate Family Planning section
    const isFamilyPlanningComplete = (
        familyplanning: FamilyPlanningEntry[]
    ): boolean => {
        return familyplanning.every((entry) => {
            return (
                    (entry.current_users_beginning_month !== undefined && entry.current_users_beginning_month >= 0) &&
                    (entry.new_acceptors_prev_month !== undefined && entry.new_acceptors_prev_month >= 0) &&
                    (entry.other_acceptors_present_month !== undefined && entry.other_acceptors_present_month >= 0) &&
                    (entry.drop_outs_present_month !== undefined && entry.drop_outs_present_month >= 0) &&
                    (entry.current_users_end_month !== undefined && entry.current_users_end_month >= 0) &&
                    (entry.new_acceptors_present_month !== undefined && entry.new_acceptors_present_month >= 0)
            );
        });
    };

    // Validate Service Data section including Teenage Pregnancy
    const isServiceDataComplete = (servicedata: ServiceData[]): boolean => {
        return servicedata.every((entry) => {
            return entry.value !== undefined && entry.value >= 0; // Non-negative number
        });
    };

    // Check for incomplete sections
    const checkIncompleteSections = (formData: FormData) => {
        const incompleteSections: string[] = [];

        // Check WRA section
        if (formData.wra.length !== 3 || !isWRAComplete(formData.wra)) {
            incompleteSections.push("WRA");
        }

        // Check Family Planning section
        if (
            formData.familyplanning.length !== 42 ||
            !isFamilyPlanningComplete(formData.familyplanning)
        ) {
            incompleteSections.push("Family Planning");
        }

        // Check Service Data sections
        const incompleteServiceSections = Object.keys(
            serviceExpectedCounts
        ).filter((serviceId) => {
            const serviceData = formData.servicedata.filter(
                (data) => data.service_id === Number(serviceId)
            );

            // Check if the number of entries matches the expected count
            const expectedCount = serviceExpectedCounts[Number(serviceId)];

            // Ensure that the count matches and the data is complete
            return (
                serviceData.length !== expectedCount ||
                !isServiceDataComplete(serviceData)
            );
        });

        if (incompleteServiceSections.length > 0) {
            incompleteSections.push(
                ...incompleteServiceSections.map((serviceId) => {
                    const service = services.find(
                        (s) => s.service_id === Number(serviceId)
                    );
                    return service
                        ? service.service_name
                        : `Service ID ${serviceId}`;
                })
            );
        }

        return incompleteSections;
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

        // Sort the arrays in place
        return {
            wra: data.wra.sort(compareWRA),
            familyplanning: data.familyplanning.sort(compareFamilyPlanning),
            servicedata: data.servicedata.sort(compareServiceData),
        };
    }

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);
    
    useEffect(() => {
        if (services.length > 0) {
            setReportDatas("m1", sortFormData(formData));
            localStorage.setItem("m1formData", JSON.stringify(formData));
        }
    }, [formData, services]); // Add services to the dependency array
    
    useEffect(() => {
        if (services.length > 0) {
            setIncompleteSections(checkIncompleteSections(formData));
        }
    }, [formData, services]); // Ensure services is included in the dependencies
    
    useEffect(() => {
        if (services.length > 0) {
            onCheckIncomplete("M1", incompleteSections);
        }
    }, [incompleteSections, services]); // Add services to the dependency array

    return (
        <>
            <div className="w-11/12 py-16">
                <header className="w-full mb-4">
                    <h1 className="mb-2 text-2xl font-bold">M1 Report</h1>
                    <div className="dividing-line w-full h-[2px] bg-black"></div>
                </header>

                {/* Progress Bar */}
                <div className="relative mb-6">
                    <div className="flex items-center w-full">
                        {[...Array(totalSteps)].map((_, index) => (
                            <div
                                key={index}
                                className="relative flex items-center flex-1"
                            >
                                {/* Circle */}
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center absolute ${
                                        step > index
                                            ? "bg-green"
                                            : "bg-gray-300"
                                    } transition-colors duration-300`}
                                    style={{
                                        zIndex: 1,
                                        left: `calc(${
                                            (100 / totalSteps) * index
                                        }% - .60rem)`,
                                    }}
                                >
                                    <span className="text-white">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                {index < totalSteps && (
                                    <div
                                        className={`flex-1 h-1 ${
                                            step > index
                                                ? "bg-green"
                                                : "bg-gray-300"
                                        } transition-colors duration-300`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Fields */}
                <section className="flex flex-col items-center justify-center gap-5">
                    {(step || 0) === 1 && (
                        <ModernWRA
                            data={formData.wra}
                            updateData={(ageCategory, field, value) =>
                                updateWRAData(
                                    setFormData,
                                    ageCategory,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 2 && (
                        <FamilyPlanning
                            data={formData}
                            updateFamilyPlanningData={(
                                ageCategory,
                                fpMethodId,
                                fpMethodName,
                                field,
                                value
                            ) =>
                                updateFamilyPlanningData(
                                    setFormData,
                                    ageCategory,
                                    fpMethodId,
                                    fpMethodName,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 3 && (
                        <PrenatalCare
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 4 && (
                        <IntrapartumCare
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 5 && (
                        <PostpartumCare
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 6 && (
                        <ImmunizationServices
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 7 && (
                        <NutritionServices
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 8 && (
                        <NutritionalAssessment
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 9 && (
                        <DewormingServices
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 10 && (
                        <SchoolBasedDeworming
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 11 && (
                        <SoilTransmitted
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 12 && (
                        <Rabies
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 13 && (
                        <Natality
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 14 && (
                        <ManagementOfSickChild
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 15 && (
                        <NonCommunicableDisease
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                    {step === 16 && (
                        <TeenagePregnancy
                            formData={formData}
                            updateServiceData={(
                                serviceId,
                                indicatorId,
                                ageCategory,
                                valueType,
                                field,
                                value
                            ) =>
                                updateServiceData(
                                    setFormData,
                                    serviceId,
                                    indicatorId,
                                    ageCategory,
                                    valueType,
                                    field,
                                    value
                                )
                            }
                        />
                    )}
                </section>

                {/* Navigation Buttons */}
                <div
                    className={`w-full navigation-buttons flex ${
                        step !== 1 ? "justify-between" : "justify-end"
                    } mt-6 sticky`}
                >
                    {step !== 1 ? (
                        <button
                            type="button"
                            className="w-24 px-5 py-2 text-white transition-all rounded cursor-pointer hover:opacity-75 bg-green shadow-md shadow-[#a3a19d]"
                            onClick={handlePreviousStep}
                            disabled={step === 1}
                        >
                            Previous
                        </button>
                    ) : null}
                    {step !== totalSteps ? (
                        <button
                            type="button"
                            className="w-24 px-5 py-2 text-white transition-all rounded cursor-pointer hover:opacity-75 bg-green shadow-md shadow-[#a3a19d]"
                            onClick={handleNextStep}
                            disabled={step === totalSteps} // Adjust based on the max step
                        >
                            Next
                        </button>
                    ) : null}
                </div>
            </div>
        </>
    );
};
