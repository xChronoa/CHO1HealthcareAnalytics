import { FormData } from "../../types/M1FormData";

interface ModernWRAProps {
    data: FormData["wra"];
    updateData: (
        ageCategory: string,
        field: keyof FormData["wra"][number],
        value: any
    ) => void;
}

export const ModernWRA: React.FC<ModernWRAProps> = ({ data, updateData }) => {
    const ageCategories = ["10-14", "15-19", "20-49"];

    return (
        <fieldset className="flex flex-col w-full gap-5 p-4 mt-5 border border-black rounded-md shadow-md shadow-[#a3a19d]">
            <legend className="px-2 text-sm font-semibold text-white rounded-lg sm:text-lg bg-green">Modern FP Unmet Need</legend>
            {/* Header Row for Indicators */}
            <div className="hidden w-full md:grid md:grid-cols-5 md:gap-4">
                <span className="flex items-center justify-center col-span-2 text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                    Indicator
                </span>
                <span className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                    10-14
                </span>
                <span className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                    15-19
                </span>
                <span className="flex items-center justify-center text-sm font-bold text-center text-gray-700 border-b-2 border-black">
                    20-49
                </span>
            </div>
            
            <div className="grid items-center grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
                <label className="flex items-center h-full col-span-1 text-xs text-gray-700 border-b-2 border-black md:col-span-2 sm:text-sm justify-left">
                    1. No. of WRA with unmet need for modern FP
                </label>
                {ageCategories.map((category) => {
                    const item = data.find(
                        (entry) => entry.age_category === category
                    );

                    return (
                        <label key={category} className="block">
                            <span className="text-gray-700 md:hidden">{category}</span>
                            <input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={item?.unmet_need_modern_fp || ""}
                                onChange={(e) =>
                                    updateData(
                                        category,
                                        "unmet_need_modern_fp",
                                        e.target.value
                                    )
                                }
                                className="block w-full p-2 mt-1 border rounded-md shadow-md shadow-[#a3a19d]"
                                required
                            />
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
};
