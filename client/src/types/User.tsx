export interface User {
    user_id?: number;
    username: string;
    password?: string;
    password_confirmation?: string;
    email: string;
    barangay_name: string;
    role?: string;
    status?: string;
};