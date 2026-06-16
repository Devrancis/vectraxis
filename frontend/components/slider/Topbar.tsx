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
          animation: marquee 30s linear infinite;
          display: inline-block;
          
          /* --- THE FIX: GPU Acceleration --- */
          will-change: transform;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }
        @keyframes marquee {
          /* Using translate3d instead of translateX forces the GPU to take over */
          0% { transform: translate3d(100vw, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); } 
        }
      `}</style>
      
    </div>
  );
}