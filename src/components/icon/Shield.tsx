export default function Shield() {
    return (
        <div className="flex items-center justify-center relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                    d="M12 2L4 5.4V11.4C4 16.4 7.4 21 12 22C16.6 21 20 16.4 20 11.4V5.4L12 2Z" 
                    stroke="#4B5563" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                />
                <path 
                    d="M9 12L11 14L15 10" 
                    stroke="#4B5563" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}