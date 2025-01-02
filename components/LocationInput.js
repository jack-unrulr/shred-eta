import { useEffect, useRef, useState } from "react";

function LocationInput({ onLocationChange }) {
  // Local state to track geolocation status
  const [isGeolocationComplete, setIsGeolocationComplete] = useState(false);

  // Local state for input value
  const [input, setInput] = useState("");

  // Local state for manual input tracking
  const [manualInput, setManualInput] = useState(false);

  // Ref to input element
  const inputRef = useRef(null);

  // Reverse geocode function to fetch readable address
  async function fetchReverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `/api/getReverseGeocode?latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();

      if (response.ok) {
        return data.address; // Return the address from the API response
      } else {
        console.error("Reverse geocoding failed:", data.error);
        return `${latitude}, ${longitude}`; // Fallback to coordinates
      }
    } catch (error) {
      console.error("Error calling reverse geocoding API:", error);
      return `${latitude}, ${longitude}`; // Fallback to coordinates
    }
  }

  // UseEffect to trigger geolocation and reverse geocoding on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Call reverse geocoding API
          const address = await fetchReverseGeocode(latitude, longitude);

          if (!manualInput) {
            setInput(address); // Update local state
            onLocationChange(address); // Pass address to parent
            setIsGeolocationComplete(true); // Mark geolocation as complete
          }
          
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsGeolocationComplete(true); // Allow fallback to manual input
        }
      );
    } else {
      console.error("Geolocation is not supported");
      setIsGeolocationComplete(true); // Allow fallback to manual input
    }
  }, [onLocationChange]);

  // UseEffect to initialize Google Maps Autocomplete
  useEffect(() => {
    if (window.google && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current);

      // Listener for place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setInput(place.formatted_address); // Update input state
          onLocationChange(place.formatted_address); // Pass address to parent
          setManualInput(true); // Mark as manual input
        }
      });
    }
  }, [onLocationChange]);

  // Update local state as user types
  const handleInput = (e) => {
    setInput(e.target.value);
    setManualInput(true); // Mark as manual input
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form behavior
    onLocationChange(input); // Update parent state
  };

  
  // if(!isGeolocationComplete) {
  //   return (
  //     <div className="text-gray-600 text-lg">
  //       Detecting your location...
  //     </div>
  //   );
  // }
    
    return (
      <div className="w-full">
        <form className="bg-white shadow-lg rounded-lg p-6 w-full" onSubmit={handleSubmit}>
          <label className="block text-lg font-semibold mb-2 text-gray-700" htmlFor="location">Your Location</label>
          <input
            className="w-full p-4 text-lg font-bold text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="location"
            type="text"
            placeholder={!isGeolocationComplete ? "Detecting your location..." : "1234 Milehigh St, Denver, CO"} 
            value={input}
            onChange={handleInput}
            ref={inputRef}
          />
          <button className="mt-4 w-full bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-600" type="submit">Submit</button>
        </form>
      </div>
    );
}

export default LocationInput;