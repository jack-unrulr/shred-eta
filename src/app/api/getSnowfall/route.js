import { NextResponse } from "next/server";

const SYNOPTIC_API_URL = "https://api.synopticdata.com/v2/stations/latest";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and Longitude are required." },
      { status: 400 }
    );
  }

  // Fetch snowfall data from the Synoptic API
  try {
    const apiKey = process.env.SYNOPTIC_PUBLIC_TOKEN;
    const radius = 10; // Limit to nearby stations (km)
    const url = `${SYNOPTIC_API_URL}?token=${apiKey}&radius=${latitude},${longitude},${radius}&vars=snow_accum_24_hour&units=english`;

    console.log("Fetching data from Synoptic API:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.summary || "Failed to fetch data from Synoptic API");
    }

    if (!data.STATION || data.STATION.length === 0) {
      console.error("No stations found near the specified coordinates.");
      return NextResponse.json(
        { error: "No stations found near the specified coordinates." },
        { status: 404 }
      );
    }

    // Calculate 24-hour snowfall in inches
    const results = data.STATION.map((station) => {
      const snowfallData = station.OBSERVATIONS.snow_accum_24_hour_value_1.value;
      if (snowfallData.length === 0) {
        return {
          station: station.NAME,
          snowfall: "No data available",
        };
      }
    
      // Return station name and snowfall data
      return {
        station: station.NAME,
        snowfall: `${snowfallData} in.`,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Server Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch snowfall data", details: error.message },
      { status: 500 }
    );
  }
}