"use client";

import Image from "next/image";
import ResortList from "../../components/ResortList";
import LocationInput from "../../components/LocationInput";
import { useState } from "react";

export default function Home() {
  // State for user location, to be shared by child components
  const [userLocation, setUserLocation] = useState("");
  
  // Callback function to update userLocation state
  const updateUserLocation = (location) => {
    setUserLocation(location);
    console.log("User location updated to: ", location);
  };

  // DOM structure
  return (
    <div>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-16">
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-900 text-center">Shred ETA 🏂</h1>
          <LocationInput onLocationChange={updateUserLocation} />
          <ResortList userLocation={userLocation}/>
        </div>
      </main>
      <footer className="">
        
      </footer>
    </div>
  );
}
