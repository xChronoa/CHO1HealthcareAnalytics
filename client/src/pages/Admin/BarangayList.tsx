import BarangayView from "../../components/BarangayView";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";
import { useBarangay } from "../../hooks/useBarangay";
import Loading from "../../components/Loading";

const BarangayList: React.FC = () => {
    const { fetchBarangays, barangays, barangayLoading } = useBarangay();

    useEffectAfterMount(() => {
        fetchBarangays();
    });

    return (
    <>
        <div className="w-11/12 py-16">
            <header className="mb-4 ">
                <h1 className="mb-2 text-2xl font-bold">List of Barangays</h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>
            <section className="grid items-center justify-center grid-cols-3 gap-5 md:gap-12">
                {barangays.map(barangay => (
                    <BarangayView key={barangay.barangay_id} logoPath={barangay.logoPath || ""}/>
                ))}
            </section>
        </div>
        {barangayLoading && <Loading />}
    </>
    );
};

export default BarangayList;
