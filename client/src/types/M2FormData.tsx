interface AgeGroup {
    [key: string]: { M: number | string; F: number | string };
}

interface InputValues {
    [key: string]: AgeGroup;
}

interface M2FormData {
    disease_id: number;
    disease_name: string;
    age_category_id: number;
    male: number;
    female: number;
    report_submission_id?: number; // Use this to track the submission status
}

export type { AgeGroup, InputValues, M2FormData }