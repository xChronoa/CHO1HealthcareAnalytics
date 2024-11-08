interface FormData {
    projectedPopulation: number | undefined;
    wra: WRA[];
    familyplanning: FamilyPlanningEntry[];
    servicedata: ServiceData[];
}

interface WRA {
    age_category: string;
    unmet_need_modern_fp: number | undefined;
    report_submission_id?: number;
}

interface FamilyPlanningEntry {
    age_category: string;
    fp_method_id: number;
    fp_method_name: string;
    current_users_beginning_month: number | undefined;
    new_acceptors_prev_month: number | undefined;
    other_acceptors_present_month: number | undefined;
    drop_outs_present_month: number | undefined;
    current_users_end_month: number | undefined;
    new_acceptors_present_month: number | undefined;
    report_submission_id?: number;
}

interface ServiceData {
    service_id: number;
    indicator_id?: number;
    age_category?: string;
    value_type?: string;
    value: number | undefined;
    remarks?: string;
    report_submission_id?: number;
}

export type { FormData, WRA, FamilyPlanningEntry, ServiceData };