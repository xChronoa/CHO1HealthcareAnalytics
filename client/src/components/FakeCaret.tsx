const FakeCaret: React.FC = () =>{
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-caret-blink">
            <div className="w-px h-8 bg-black" />
        </div>
    );
}

export default FakeCaret;