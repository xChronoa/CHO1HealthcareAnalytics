import { SideBarButton } from "./SidebarButton";
import { useRef, useState } from "react";
import cabuyao_logo from "../assets/cabuyao_logo.png";

// type Prop = {
//     user?: string;
//     barangayLogoPath?: string;
// };

export const Sidebar = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    let sidebar = useRef<HTMLDivElement>(null);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
        
        sidebar.current?.classList.contains("w-1/6") ? sidebar.current.classList.replace("w-1/6", "w-20") : sidebar.current?.classList.replace("w-20", "w-1/6");
    };

    return (
        <nav ref={sidebar} className="absolute z-40 w-1/6 h-full transition-all bg-white shadow-2xl">
            <div className="relative flex flex-col items-center justify-between w-full h-full pb-20 nav-wrapper">
                <div className="flex flex-col items-center justify-start gap-5 py-5 mt-12 title">
                    <div
                        id="dividing-line"
                        className="w-11/12 h-1 bg-black rounded"
                    ></div>

                    <img src={cabuyao_logo} alt="" />
                    <h3>Barangay Marinig</h3>

                    <div
                        id="dividing-line"
                        className="w-11/12 h-1 bg-black rounded"
                    ></div>
                </div>

                <SideBarButton />
                <SideBarButton />
                
                <input
                    onChange={toggleSidebar}
                    className="absolute top-0 right-0 m-5"
                    type="checkbox"
                    name="checkbox"
                    id="checkbox"
                />
                <button className="w-11/12 py-2 font-semibold text-white uppercase transition-all bg-red-700 rounded-md shadow-2xl hover:scale-95">Log-out</button>
            </div>
        </nav>
    );
};
