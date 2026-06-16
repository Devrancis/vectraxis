export default function Topbar() {
  return (
    <div className="flex w-full overflow-hidden bg-gray-950 py-2 text-sm font-semibold tracking-wide text-green-400 border-b border-green-900/50">
      
      <div className="animate-marquee whitespace-nowrap">
        <span className="mx-8">
          Track actors. Anticipate tactics 
          <span className="text-gray-500 px-3">•</span> 
          Defend the perimeter 
          <span className="text-gray-500 px-3">•</span> 
          Illuminating the dark corners of the MITRE Matrix
        </span>
      </div>

      <style>{`
        .animate-marquee {
          /* Increased to 30s since it has to travel a further distance now */
          animation: marquee 30s linear infinite;
          display: inline-block;
        }
        @keyframes marquee {
          /* Start exactly off the right edge of the browser window */
          0% { transform: translateX(100vw); }
          /* Pull to the left until the text completely clears its own width */
          100% { transform: translateX(-100%); } 
        }
      `}</style>
      
    </div>
  );
}