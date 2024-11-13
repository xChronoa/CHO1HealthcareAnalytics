const Loading: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-white bg-opacity-60"> {/* Added z-50 */}
            <div className="flex flex-col-reverse items-center justify-center">
                <div className="mt-5 text flex flex-row items-center justify-center gap-1">
                    <span className="text-3xl text-center">Loading</span>
                    <div className="dots flex gap-2 self-end mb-2">
                        <div className='h-1 w-1 bg-black rounded-full animate-bounceHigh [animation-delay:-0.3s]'></div>
                        <div className='h-1 w-1 bg-black rounded-full animate-bounceHigh [animation-delay:-0.15s]'></div>
                        <div className='h-1 w-1 bg-black rounded-full animate-bounceHigh'></div>
                    </div>
                </div>
                <svg
                    className="w-8 h-8 text-gray-800 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

export default Loading;
