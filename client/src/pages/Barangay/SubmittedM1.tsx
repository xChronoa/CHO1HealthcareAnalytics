import useEffectAfterMount from "../../hooks/useEffectAfterMount";

interface SubmittedM1Props {
    selectedDate: string;
}

const SubmittedM1: React.FC<SubmittedM1Props> = ({ selectedDate }) => {

    useEffectAfterMount(() => {

    }, [])

    return (
        <>
        m1
        </>
    );
};

export default SubmittedM1;
