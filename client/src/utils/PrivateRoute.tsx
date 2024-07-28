import { Outlet, Navigate } from "react-router-dom";

export const PrivateRoute: React.FC = () => {
    const user: boolean = false;

    return(
        <>
            {user ? <Outlet/> : <Navigate to={"login"}/>}
        </>
    );
};