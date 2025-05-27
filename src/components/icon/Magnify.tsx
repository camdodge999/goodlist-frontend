export default function Magnify() {
    return (
        <>
            <div className="absolute hidden md:block">
                <svg
                    width="600"
                    height="600"
                    viewBox="0 0 160 160"
                    fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-15 -rotate-12 transform scale-150"
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-200px',
                    transform: 'translateY(-50%) rotate(-12deg) scale(1.5)'
                }}
            >
                {/* Magnifying Glass Handle */}
                <path
                    d="M110 110L140 140"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                />

                {/* Magnifying Glass Circle */}
                <circle
                    cx="70"
                    cy="70"
                    r="50"
                    stroke="white"
                    strokeWidth="10"
                    fill="none"
                />
            </svg>
      </div >

        <div className = "max-w-2xl w-full text-center space-y-8 relative z-10" >
            <div className="mb-8 flex justify-center">
                <svg
                    width="160"
                    height="160"
                    viewBox="0 0 160 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-lg"
                >
                    {/* Magnifying Glass Handle */}
                    <path
                        d="M110 110L140 140"
                        stroke="white"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Magnifying Glass Circle */}
                    <circle
                        cx="70"
                        cy="70"
                        r="50"
                        stroke="white"
                        strokeWidth="10"
                        fill="none"
                    />

                    {/* X Mark */}
                    <path
                        d="M50 70L90 70"
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M70 50L70 90"
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Rotate the vertical line to make an X */}
                    <path
                        d="M55 55L85 85"
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M85 55L55 85"
                        stroke="white"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>  
        </>
    )   
}
