interface GeneratePasswordIconProps {
    className?: string; // Changed 'class' to 'className' to follow React naming conventions
    onClick?: () => void; // Optional onClick handler
}

const GeneratePasswordIcon: React.FC<GeneratePasswordIconProps> = ({
    className,
    onClick, // Renamed the prop to 'className' to avoid conflicts with the 'class' attribute
}) => {
    return (
        <div className={className} onClick={onClick}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                aria-labelledby="icon-generate-password"
                focusable="false"
                viewBox="0 0 24 24"
                width="20"
                height="20"
            >
                <g>
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.9101 6.62789L12.809 6L12 7.49007L11.191 6L10.0899 6.62789L10.9483 8.15076H9.28091V9.43935H10.9483L10.0944 10.9575L11.1865 11.6417L12 10.1422L12.8135 11.6417L13.9056 10.9575L13.0517 9.43935H14.7191V8.15076H13.0517L13.9101 6.62789ZM5.52809 6.04685L6.62472 6.67474L5.77079 8.19762H7.4382V9.4862H5.77079L6.62472 11.0044L5.52809 11.637L4.7191 10.1422L3.91011 11.637L2.80899 11.0044L3.66742 9.4862H2V8.19762H3.66742L2.80899 6.67474L3.91011 6.04685L4.7191 7.53692L5.52809 6.04685ZM2 15.5238H22V17.4286H2V15.5238ZM20.3326 8.15076H22V9.43935H20.3326L21.1865 10.9575L20.0944 11.6417L19.2809 10.1422L18.4674 11.6417L17.3753 10.9575L18.2292 9.43935H16.5618V8.15076H18.2292L17.3708 6.62789L18.4719 6L19.2809 7.49007L20.0899 6L21.191 6.62789L20.3326 8.15076Z"
                    ></path>
                </g>
            </svg>
        </div>
    );
};

export default GeneratePasswordIcon;
