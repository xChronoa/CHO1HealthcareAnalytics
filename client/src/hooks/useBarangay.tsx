import { useState } from 'react';
import logos from '../assets/logoImports';
import { baseAPIUrl } from '../config/apiConfig';
import { useLoading } from '../context/LoadingContext';

interface Barangay {
    barangay_id: number;
    barangay_name: string;
    logoPath?: string;
}

export const useBarangay = () => {
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const { incrementLoading, decrementLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);

    const fetchBarangays = async () => {
        try {
            incrementLoading();
            const response = await fetch(`${baseAPIUrl}/barangays`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('There was an issue fetching the barangay data. Please reload the page or try again later.');
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
            decrementLoading();
        }
    };


    return { fetchBarangays, barangays, error };
};
