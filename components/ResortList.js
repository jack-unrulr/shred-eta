import resorts from "../data/resorts";
import { useEffect, useState, useRef, createRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ResortItem from "./ResortItem";

function ResortList({ userLocation }) {
  const [resortsList, setResortsList] = useState([]);
  const [snowfallData, setSnowfallData] = useState({});

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

  // Filter resorts by pass type
  // Default to "All"
  const [passFilter, setPassFilter] = useState("All");
  const nodeRefs = useRef({});
  const [filteredAndTaggedResorts, setFilteredAndTaggedResorts] = useState([]);
  
  // Save filter to local storage
  useEffect(() => {
    const savedFilter = localStorage.getItem("passFilter");
    if (savedFilter) {
      setPassFilter(savedFilter);
    }
  }, []);
  
  // Handle filter change
  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setPassFilter(event.target.value);
    localStorage.setItem("passFilter", selectedFilter);
  }
  
  // Filter and tag resorts
  useEffect(() => {
    const filteredResortsList = resortsList.filter((resort) => {
      if (passFilter === "All") return true;
      return resort.pass === passFilter;
    });

    const tagClosestResort = (filteredResortsList) => {
      resortsList.forEach((resort) => {
        delete resort.tag;
      });
      if (filteredResortsList.length > 0) {
        filteredResortsList[0].tag = "Closest";
      }
    }

    tagClosestResort(filteredResortsList);
    setFilteredAndTaggedResorts(filteredResortsList);
  }, [resortsList, passFilter]);

  return (
    <div className="mt-12 w-full">
      
      <h2 className="resort-list-h2 block text-xl font-semibold text-gray-700">
        How long until shred from{" "}
        <span className="text-blue-500">{userLocation || "Detecting your location..."}</span>
      </h2>

      <div className="mt-4">
        <label htmlFor="filter" className="mr-2 text-gray-500">Filter by Ikon / Epic:</label>
        <select id="filter" value={passFilter} onChange={handleFilterChange} className="text-gray-600 p-1 rounded-md">
          <option value="All">All</option>
          <option value="Ikon">Ikon</option>
          <option value="Epic">Epic</option>
        </select>
      </div>

      <TransitionGroup component="ul" className="mt-8 w-full space-y-4">
        {filteredAndTaggedResorts.map((resort) => {
          if (!nodeRefs.current[resort.name]) {
            nodeRefs.current[resort.name] = createRef();
          }
          return (
            <CSSTransition key={resort.name} timeout={500} classNames="fade" nodeRef={nodeRefs.current[resort.name]}>
              <ResortItem ref={nodeRefs.current[resort.name]} resort={resort} snowfallData={snowfallData} />
            </CSSTransition>
          );
        })}
      </TransitionGroup>
      
      {/* Styling for mobile */}
      <style jsx>{`
        @media (max-width: 640px) {
          .resort-list-h2 {
            font-size: 1.2rem;
          }
      `}</style>
    
    </div>
  );
}

export default ResortList;