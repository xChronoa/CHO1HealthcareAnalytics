import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

type Prop = {
    icon?: IconProp
}

export const SideBarButton = ({ icon }: Prop) => {
    return(
        <div className="flex flex-row items-center w-11/12 gap-5 p-3 border-2 border-black rounded-md shadow-2xl">
            <FontAwesomeIcon icon={faClockRotateLeft} className="justify-self-start"/>
            <h3 className="justify-self-center">History</h3>
        </div>
    );
}