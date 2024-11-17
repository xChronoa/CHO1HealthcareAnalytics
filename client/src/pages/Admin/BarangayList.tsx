import { useEffect } from "react";
import { useBarangay } from "../../hooks/useBarangay";
import BarangayView from "../../components/BarangayView";
import { useLoading } from "../../context/LoadingContext";

const BarangayList: React.FC = () => {
    const { fetchBarangays, barangays } = useBarangay();
    const { isLoading } = useLoading();

    useEffect(() => {
        fetchBarangays();
    }, []);

    return (
    <>
        <div className="w-11/12 pb-12 pt-6">
            <header className="mb-4 ">
                <h1 className="mb-2 text-2xl font-bold">List of Barangays</h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>
            <section className="grid items-center justify-center grid-cols-3 gap-5 md:gap-12">
                {isLoading ? (
                    <>
                        {/* Repeat the placeholder for each barangay */}
                        {[...Array(9)].map((_, index) => (
                            <div key={index} className="flex flex-col items-center justify-center gap-2 transition-all">
                                <div className="bg-gray-200 rounded-full shadow-xl md:scale-90 shadow-neutral-400 animate-pulse"
                            style={{
                                maxWidth: '194.4px', // Max width
                                maxHeight: '193.5px', // Max height
                                width: "100%",
                                height: "100%",
                                minWidth: '101.25px', // Min width
                                minHeight: '100.78px', // Min height
                                aspectRatio: "1"
                            }} />
                                <div className="w-full px-5 py-2 bg-gray-200 rounded-lg shadow-md border-[2px] shadow-gray-500 animate-pulse" />
                            </div>
                        ))}
                    </>

                ) : (
                    barangays.map(barangay => (
                        <BarangayView
                            key={barangay.barangay_id}
                            barangayId={barangay.barangay_id}
                            barangayName={barangay.barangay_name}
                            logoPath={barangay.logoPath || ""}
                        />
                    ))
                )}
            </section>
        </div>
    </>
    );
};

export default BarangayList;
