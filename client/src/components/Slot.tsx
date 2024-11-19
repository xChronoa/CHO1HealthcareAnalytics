import { SlotProps } from "input-otp";
import FakeCaret from "./FakeCaret";
import cn from "classnames";

const Slot: React.FC<SlotProps> = (props) => {
    const showCaret = props.isActive && !props.char;

    return (
        <div
            className={cn(
                "relative w-8 h-12 sm:w-10 sm:h-14 text-[1.5rem] sm:text-[2rem] bg-white",
                "flex items-center justify-center",
                "transition-all duration-300",
                "border-border border first:border-l first:rounded-l-md last:rounded-r-md",
                "group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20",
                "outline outline-0 outline-accent-foreground/20",
                { "outline-4 outline-accent-foreground": props.isActive }
            )}
        >
            {props.char !== null && <div>{props.char}</div>}
            {showCaret && <FakeCaret />}
        </div>
    );
}

export default Slot;