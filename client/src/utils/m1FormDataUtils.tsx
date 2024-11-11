import { FormData, FamilyPlanningEntry, ServiceData } from "../types/M1FormData";

export const updateWRAData = (
    setFormData: React.Dispatch<React.SetStateAction<FormData>>,
    ageCategory: string,
    field: keyof FormData["wra"][number],
    value: any
) => {
    setFormData((prevData) => {
        const existingIndex = prevData.wra.findIndex(
            (item) => item.age_category === ageCategory
        );

        let updatedWRA: typeof prevData.wra;

        if (existingIndex > -1) {
            updatedWRA = prevData.wra.map((item, i) =>
                i === existingIndex ? { ...item, [field]: value === "" ? "" : Number(value) } : item
            );
        } else {
            updatedWRA = [
                ...prevData.wra,
                {
                    age_category: ageCategory,
                    unmet_need_modern_fp: undefined,
                    [field]: value,
                },
            ];
        }

        return { ...prevData, wra: updatedWRA };
    });
};

export const updateFamilyPlanningData = (
    setFormData: React.Dispatch<React.SetStateAction<FormData>>,
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
            updatedFamilyPlanning = prevData.familyplanning.map((item, i) =>
                i === existingIndex ? { ...item, [field]: value === "" ? "" : Number(value) } : item
            );
        } else {
            updatedFamilyPlanning = [
                ...prevData.familyplanning,
                {
                    age_category: ageCategory,
                    fp_method_id: fpMethodId,
                    fp_method_name: fpMethodName,
                    current_users_beginning_month: undefined,
                    new_acceptors_prev_month: undefined,
                    other_acceptors_present_month: undefined,
                    drop_outs_present_month: undefined,
                    current_users_end_month: undefined,
                    new_acceptors_present_month: undefined,
                    [field]: value,
                },
            ];
        }

        return { ...prevData, familyplanning: updatedFamilyPlanning };
    });
};

export const updateServiceData = (
    setFormData: React.Dispatch<React.SetStateAction<FormData>>,
    serviceId: number,
    indicatorId: number | undefined,
    ageCategory: string | undefined,
    valueType: string | undefined,
    field: keyof ServiceData,
    value: any
) => {
    setFormData((prevData) => {
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
            updatedServices = prevData.servicedata.map((item, i) =>
                i === existingIndex ? { ...item, [field]: value } : item
            );
        } else {
            updatedServices = [
                ...prevData.servicedata,
                {
                    service_id: serviceId,
                    indicator_id: indicatorId,
                    age_category: ageCategory ?? "",
                    value_type: valueType ?? "",
                    value: field === "value" ? value : undefined,
                    remarks: field === "remarks" ? value : "",
                } as ServiceData,
            ];
        }

        return { ...prevData, servicedata: updatedServices };
    });
};
