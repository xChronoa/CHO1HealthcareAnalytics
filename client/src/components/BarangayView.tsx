import { useNavigate } from "react-router-dom";

interface BarangayViewProp {
    logoPath: string;
    barangayId: number; // Add barangayId prop
    barangayName: string; // Add barangayName prop for URL
}

const BarangayView: React.FC<BarangayViewProp> = ({ logoPath, barangayId, barangayName }) => {
    const navigate = useNavigate();

    const handleViewClick = () => {
        navigate(`/admin/report/submitted/${barangayName.toLowerCase()}`, { state: { barangayId, barangayName } }); // Pass barangayId in state
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2 transition-all">
            <img 
                src={logoPath} 
                alt="Barangay Logo" 
                className="rounded-full shadow-xl md:scale-90 shadow-neutral-400" 
                loading="lazy"
            />
            <button
                onClick={handleViewClick}
                className="text-[.5rem] sm:text-sm font-extrabold w-full sm:px-5 py-2 uppercase transition-all bg-white rounded-lg shadow-md border-[2px] hover:bg-green hover:border-white hover:text-white shadow-gray-500 min-h-[3rem]"
            >
                View {barangayName}
            </button>
        </div>
    );
};

export default BarangayView;
