interface BarangayViewProp {
    logoPath: string;
}

const BarangayView: React.FC<BarangayViewProp> = ({ logoPath }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-2 transition-all">
            <img src={logoPath} alt="Barangay Logo" className="rounded-full shadow-xl md:scale-90 shadow-neutral-400" />
            <button className="w-full px-5 py-2 uppercase transition-all bg-white rounded-lg shadow-md border-[2px] hover:bg-green hover:border-white hover:text-white shadow-gray-500">
                View
            </button>
        </div>
    );
};

export default BarangayView;
