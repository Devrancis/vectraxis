export default function Topbar() {
  return (
    <div className="flex w-full overflow-hidden bg-gray-950 py-2 text-sm font-semibold tracking-wide text-green-400 border-b border-green-900/50">
      
      {/* The animated container */}
      <div className="animate-marquee flex whitespace-nowrap">
        
        {/* First instance of the text */}
        <span className="mx-8">
          Track actors. Anticipate tactics 
          <span className="text-gray-500 px-3">•</span> 
          Defend the perimeter 
          <span className="text-gray-500 px-3">•</span> 
          Illuminating the dark corners of the MITRE Matrix
        </span>

        {/* Duplicated instance to create a seamless infinite loop */}
        <span className="mx-8">
          Track actors. Anticipate tactics 
          <span className="text-gray-500 px-3">•</span> 
          Defend the perimeter 
          <span className="text-gray-500 px-3">•</span> 
          Illuminating the dark corners of the MITRE Matrix
        </span>
        
      </div>

      {/* Inline CSS for the exact right-to-left math */}
      <style>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          /* Slides exactly half the width of the duplicated text to loop perfectly */
          100% { transform: translateX(-50%); } 
        }
      `}</style>
      
    </div>
  );
}