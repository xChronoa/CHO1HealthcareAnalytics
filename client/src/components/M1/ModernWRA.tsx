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
        <fieldset className="w-11/12 p-4 border border-black rounded-md sm:w-fit">
            <legend className="text-lg font-semibold">Modern FP Unmet Need</legend>
            <div className="flex flex-col gap-4 sm:flex-row">
                <label className="flex flex-col justify-center w-full text-gray-700 border-b-2 border-black sm:w-1/2">
                    No. of WRA with unmet need for modern FP
                </label>
                <div className="flex flex-col w-full gap-4 sm:flex-row sm:justify-evenly sm:w-3/4">
                    {ageCategories.map((category) => {
                        const item = data.find(
                            (entry) => entry.age_category === category
                        );

                        return (
                            <label key={category} className="block">
                                <span className="text-gray-700">{category}</span>
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
                                    className="block w-full p-2 mt-1 border rounded-md sm:w-24"
                                    required
                                />
                            </label>
                        );
                    })}
                </div>
            </div>
        </fieldset>
    );
};
