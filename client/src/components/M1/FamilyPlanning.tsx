import React from "react";
import { FamilyPlanningEntry } from "../../types/M1FormData";
import { baseAPIUrl } from "../../config/apiConfig";

interface FPMethod {
    method_id: number;
    method_name: string;
}

interface FamilyPlanningProps {
    data: { familyplanning: FamilyPlanningEntry[] };
    updateFamilyPlanningData: (
        ageCategory: string,
        fpMethodId: number,
        fpMethodName: string,
        field: keyof FamilyPlanningEntry,
        value: any
    ) => void;
}

export const FamilyPlanning: React.FC<FamilyPlanningProps> = ({
    data,
    updateFamilyPlanningData,
}) => {
    const ageCategories = ["10-14", "15-19", "20-49"];

    const [fpMethods, setFPMethods] = React.useState<FPMethod[]>([]);
    const [fpLoading, setFPLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchFPMethods = async () => {
            setFPLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${baseAPIUrl}/fp-method`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch FP methods: ${response.statusText}`
                    );
                }

                const data: FPMethod[] = await response.json();
                setFPMethods(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setFPLoading(false);
            }
        };

        fetchFPMethods();
    }, []);

    const inputFields = [
        {
            label: "Current Users (Beginning Month)",
            key: "current_users_beginning_month",
        },
        {
            label: "New Acceptors (Previous Month)",
            key: "new_acceptors_prev_month",
        },
        {
            label: "Other Acceptors (Present Month)",
            key: "other_acceptors_present_month",
        },
        {
            label: "Drop-Outs (Present Month)",
            key: "drop_outs_present_month",
        },
        {
            label: "Current Users (End Month)",
            key: "current_users_end_month",
        },
        {
            label: "New Acceptors (Present Month)",
            key: "new_acceptors_present_month",
        },
    ];

    const getInputValue = (
        ageCategory: string,
        methodId: number,
        fieldKey: keyof FamilyPlanningEntry
    ): string | number => {
        const entry = data.familyplanning.find(
            (entry) =>
                entry.age_category === ageCategory &&
                entry.fp_method_id === methodId
        );
        return entry ? entry[fieldKey] || 0 : 0;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        ageCategory: string,
        methodId: number,
        methodName: string,
        fieldKey: keyof FamilyPlanningEntry
    ) => {
        
        const { value } = e.target;
        updateFamilyPlanningData(
            ageCategory,
            methodId,
            methodName,
            fieldKey,
            value
        );
    };

    return (
        <>
            {ageCategories.map((category) => (
                <fieldset
                    key={category}
                    className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md"
                >
                    <legend className="px-2 text-sm font-semibold text-white rounded-lg sm:text-lg bg-green">
                        User of Family Planning Method for {category} years old
                    </legend>

                    {fpLoading ? (
                        <div>Loading family planning methods...</div>
                    ) : error ? (
                        <div>
                            Error fetching family planning methods: {error}
                        </div>
                    ) : (
                        <>
                            {/* Header Row */}
                            <div className="hidden grid-cols-1 gap-2 mb-4 md:grid md:grid-cols-7">
                                <div className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                                    Method
                                </div>
                                {inputFields.map((field) => (
                                    <div
                                        key={field.key}
                                        className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black"
                                        // Put the text wrapped in parenthesis to next line.
                                        dangerouslySetInnerHTML={{
                                            __html: field.label.replace(/\s*\(\s*/g, '<br>(').replace(/\s*\)\s*/g, ')<br>')
                                        }}
                                    />
                                ))}
                            </div>

                            {fpMethods.map((method) => {
                                if (
                                    method.method_name === "d. Pills" ||
                                    method.method_name ===
                                        "g. IUD (IUD-I and IUD-PP)"
                                ) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={method.method_id}
                                        className="grid items-center grid-cols-1 gap-8 mb-4 md:gap-2 md:grid-cols-7"
                                    >
                                        <div className="flex items-center h-full text-xs font-bold text-gray-700 border-b-2 border-black sm:text-sm justify-left">
                                            {method.method_name}
                                        </div>
                                        {inputFields.map((field) => (
                                            <div key={field.key} className="relative">
                                                <label
                                                    htmlFor={field.key}
                                                    className="absolute top-[-1.2rem] left-0 md:hidden text-[.8rem] text-gray-500"
                                                >{field.label}</label>
                                                <input
                                                    key={field.key}
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    className="w-full p-2 border rounded-md"
                                                    value={
                                                        getInputValue(
                                                            category,
                                                            method.method_id,
                                                            field.key as keyof FamilyPlanningEntry
                                                        ) || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            e,
                                                            category,
                                                            method.method_id,
                                                            method.method_name,
                                                            field.key as keyof FamilyPlanningEntry
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </fieldset>
            ))}
        </>
    );
};
