import { FormData } from "../../types/M1FormData";

interface ModernWRAProps {
    data: FormData["wra"];
    updateData: (
        index: number,
        field: keyof FormData["wra"][number],
        value: any
    ) => void;
}

export const ModernWRA: React.FC<ModernWRAProps> = ({ data, updateData }) => {
    return (
        <fieldset className="w-11/12 p-4 border border-black rounded-md sm:w-fit">
            <legend className="text-lg font-semibold">Modern FP Unmet Need</legend>
            <div className="flex flex-col gap-4 sm:flex-row">
                <label className="flex flex-col justify-center w-full text-gray-700 border-b-2 border-black sm:w-1/2">
                    No. of WRA with unmet need for modern FP
                </label>
                <div className="flex flex-col w-full gap-4 sm:flex-row sm:justify-evenly sm:w-3/4">
                    {data.map((item, index) => (
                        <label key={index} className="block">
                            <span className="text-gray-700">{item.age_category}</span>
                            <input
                                type="number"
                                                placeholder="0"
                                min="0"
                                value={item.unmet_need_modern_fp || ""}
                                onChange={(e) =>
                                    updateData(index, "unmet_need_modern_fp", Number(e.target.value))
                                }
                                className="block w-full p-2 mt-1 border rounded-md sm:w-24"
                                required
                            />
                        </label>
                    ))}
                </div>
            </div>
        </fieldset>
    );
};
