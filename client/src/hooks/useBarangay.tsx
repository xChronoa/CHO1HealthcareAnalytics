import { useState } from 'react';
import logos from '../assets/logoImports';

interface Barangay {
    barangay_id: number;
    barangay_name: string;
    logoPath?: string;
}

export const useBarangay = () => {
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [barangayLoading, setBarangayLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBarangays = async () => {
        try {
            setBarangayLoading(true);
            const response = await fetch('http://localhost:8000/api/barangays', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch barangays');
            }

            const data: Barangay[] = await response.json();

            // Attach the corresponding logoPath to each barangay
            const barangaysWithLogos = data.map(barangay => ({
                ...barangay,
                logoPath: logos[barangay.barangay_name.toLowerCase() as keyof typeof logos] || '',
            }));

            setBarangays(barangaysWithLogos);
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setBarangayLoading(false);
        }
    };


    return { fetchBarangays, barangays, barangayLoading, error };
};
