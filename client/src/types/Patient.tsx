export interface Patient {
    patient_id: number; // or use 'string' if patient_id is a string
    first_name: string;
    last_name: string;
    sex: 'male' | 'female';
    birthdate: string; // ISO date string
    address: string;
    phone_number?: string; // Optional field
    email: string;
}