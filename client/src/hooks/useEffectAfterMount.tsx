import { useRef, useEffect } from "react";

export default function useEffectAfterMount(
    callback: () => void, 
    dependencies: any[] = []
) {
    const isMounted = useRef(false);

    useEffect(() => {
        if(!isMounted.current) {
            isMounted.current = true;
            return;
        }

        callback();
    }, dependencies);
};