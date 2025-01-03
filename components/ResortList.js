import resorts from "../data/resorts";
import { useEffect, useState } from "react";

function ResortList({ userLocation }) {
  const [resortsList, setResortsList] = useState([]);

  // Fetch transit times for each resort
  useEffect(() => {
    if (!userLocation) {
      console.log("No userLocation");
      return;
    }

    async function fetchTransitTimes() {
      const times = {};
      const fetchPromises = resorts.map(async (resort) => {
        try {
          const response = await fetch(
            `/api/getTransitTime?origin=${encodeURIComponent(
              userLocation
            )}&destination=${encodeURIComponent(resort.location)}`
          );
          const data = await response.json();
          times[resort.name] = data.transitTime || "Unavailable";
        } catch (error) {
          console.error(`Error fetching transit time for ${resort.name}:`, error);
          times[resort.name] = "Unavailable";
        }
      });

      await Promise.all(fetchPromises);
      console.log("Fetched transit times:", times);

      const sortedResortsList = resorts
        .map((resort) => ({
          ...resort,
          transitTime: times[resort.name],
          transitTimeMinutes: parseTransitTime(times[resort.name]),
        }))
        .sort((a, b) => {
          if (a.transitTimeMinutes === null) return 1;
          if (b.transitTimeMinutes === null) return -1;
          return a.transitTimeMinutes - b.transitTimeMinutes;
        });

      // Tag the closest resort
      if (sortedResortsList.length > 0) {
        sortedResortsList[0].tag = "Closest";
      }

      setResortsList(sortedResortsList);
    }

    fetchTransitTimes();
  }, [userLocation]);

  // Helper function to parse transit time
  function parseTransitTime(transitTime) {
    if (transitTime === "Unavailable") return null;
    const timeParts = transitTime.match(/(\d+)\s*hour[s]?\s*(\d+)?\s*min[s]?|(\d+)\s*min[s]?/);
    if (!timeParts) {
      console.log("Failed to parse transit time:", transitTime);
      return null;
    }
    const hours = parseInt(timeParts[1], 10) || 0;
    const minutes = parseInt(timeParts[2] || timeParts[3], 10) || 0;
    return hours * 60 + minutes;
  }


  // Fetch snowfall data for each resort
  const [snowfallData, setSnowfallData] = useState({});

  useEffect(() => {
    const fetchSnowfall = async () => {
      const results = {};
      for (const resort of resorts) {
        try {
          const response = await fetch(
            `/api/getSnowfall?latitude=${resort.lat}&longitude=${resort.lng}`
          );
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const firstStation = data.results[0];
            results[resort.name] = {
              snowfall: firstStation.snowfall || "No data",
              station: firstStation.station || "Unknown Station",
            };
            console.log(`Fetched snowfall for ${resort.name}:`, firstStation);
          } else {
            results[resort.name] = { snowfall: "No data", station: "No station" };
          }
        } catch (error) {
          console.error(`Failed to fetch snowfall for ${resort.name}:`, error);
          results[resort.name] = { snowfall: "Error", station: "Error" };
        }
      }
      setSnowfallData(results);
    };

    fetchSnowfall();
  }, []);

  return (
    <div className="mt-12 w-full">
      
      <h2 className="resort-list-h2 block text-xl font-semibold text-gray-700">
        Time to Resorts from{" "}
        <span className="text-blue-500">{userLocation || "Detecting your location..."}</span>
      </h2>

      <ul className="mt-8 w-full space-y-4">
        {resortsList.map((resort) => (
          
          <li
            className={`resort-item w-full flex justify-between items-center bg-white shadow-md rounded-lg p-6 relative 
            ${resort.tag === "Closest" ? "border-2 border-green-500 items-baseline" : ""}`}
            key={resort.name}
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
            
            
          </li>
          
        ))}
      </ul>
      
      {/* Styling for mobile */}
      <style jsx>{`
        @media (max-width: 640px) {
          .resort-list-h2 {
            font-size: 1.2rem;
          }
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
    
    </div>
  );
}

export default ResortList;