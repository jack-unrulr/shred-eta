import React from 'react';

const ResortItem = React.forwardRef(({ resort, snowfallData }, ref) => (
    <li
    ref={ref}
    className={`resort-item w-full flex justify-between items-center bg-white shadow-md rounded-lg p-6 relative 
    ${resort.tag === "Closest" ? "border-2 border-green-500 items-baseline" : ""}`}
    
  >
    
    {resort.tag === "Closest" && (
      <p className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
        Closest
      </p>
    )}

    <div className="li-inner-flex flex items-center">
      
        <img
          src={resort.img}
          alt={resort.name}
          className="resort-logo w-10 h-10 rounded-lg mr-6"
        />
      
      <div className="space-y-1">
        
        <div className="flex items-center space-x-2">
          <a
            href={resort.url}
            className="resort-name text-xl font-bold text-blue-950 hover:underline"
          >
            {resort.name}
          </a>
          {resort.pass === "Ikon" && (
            <p className="bg-yellow-400 text-white text-xs font-semibold px-1 py-0.5 rounded">
            Ikon
            </p>
          )}
      
          {resort.pass === "Epic" && (
            <p className="bg-blue-900 text-white text-xs font-semibold px-1 py-0.5 rounded">
             Epic
            </p>
          )}
        
        </div>

        <p className="transit-time text-lg font-semibold text-gray-700">
          {resort.transitTime ? "🛻 "+resort.transitTime : "Loading..."}
        </p>
        
        <div className="snowfall-div text-md flex space-x-2">
          <p className="font-semibold text-gray-700">🌨️ Recent Snowfall: </p>
          <p className="font-medium text-gray-600">{snowfallData[resort.name]?.snowfall || "Loading..."} </p>
        </div>
      
      </div>  
    </div>
  {/* Styling for mobile */}
  <style jsx>{`
        @media (max-width: 640px) {
          .resort-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .li-inner-flex {
            flex-direction: column;
            align-items: flex-start;
          }
          .snowfall-div{
            font-size: 0.8rem;
          }
          .resort-name {
            font-size: 1.2rem;
          }
          .transit-time {
            font-size: 1rem;
          }
          .resort-logo {
            width: 2rem;
            height: 2rem;
            margin-bottom: 0.5rem;
          }
      `}</style>
  </li>
));

export default ResortItem;