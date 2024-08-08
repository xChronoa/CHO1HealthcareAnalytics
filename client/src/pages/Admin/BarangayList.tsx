import BarangayView from "../../components/BarangayView";
import logos from '../../assets/logoImports'; // Adjust path as needed

interface Barangay {
    name: string;
    logoPath: string;
}

const BarangayList: React.FC = () => {
    const barangays: Barangay[] = [
        { name: "bigaa", logoPath: logos.bigaa },
        { name: "butong", logoPath: logos.butong },
        { name: "gulod", logoPath: logos.gulod },
        { name: "marinig", logoPath: logos.marinig },
        { name: "niugan", logoPath: logos.niugan },
        { name: "poblacion uno", logoPath: logos["poblacion uno"] },
        { name: "poblacion dos", logoPath: logos["poblacion dos"] },
        { name: "poblacion tres", logoPath: logos["poblacion tres"] },
        { name: "sala", logoPath: logos.sala },
    ];

    return (
        <div className="w-11/12 py-16">
            <header className="mb-4 ">
                <h1 className="mb-2 text-2xl font-bold">List of Barangays</h1>
                <div className="dividing-line w-full h-[2px] bg-black"></div>
            </header>
            <section className="grid items-center justify-center grid-cols-3 gap-5 md:gap-12">
                {barangays.map(barangay => (
                    <BarangayView logoPath={barangay.logoPath}/>
                ))}
            </section>
        </div>
    );
};

export default BarangayList;
