interface FormData {
    wra: {
        age_category: string;
        unmet_need_modern_fp: number;
        report_status_id?: number;
    }[];
    familyplanning: FamilyPlanningEntry[];
    servicedata: ServiceData[];
    teenagepregnancy: {
        service_id: number;
        age_category: string;
        value_type: string;
        value: number;
        report_status_id?: number;
    }[];
}

interface WRA {
    age_category: string;
    unmet_need_modern_fp: number;
    report_status_id?: number;
}

interface FamilyPlanningEntry {
    age_category: string;
    fp_method_id: number;
    fp_method_name: string;
    current_users_beginning_month: number;
    new_acceptors_prev_month: number;
    other_acceptors_present_month: number;
    drop_outs_present_month: number;
    current_users_end_month: number;
    new_acceptors_present_month: number;
    report_status_id?: number;
}

interface ServiceData {
    service_id: number;
    indicator_id?: number;
    age_category?: string;
    value_type?: string;
    value: number;
    remarks?: string;
    report_status_id?: number;
}

export type { FormData, WRA, FamilyPlanningEntry, ServiceData };