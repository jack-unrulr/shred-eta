import { NextResponse } from "next/server";

const OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const todaysDate = new Date().toISOString().split("T")[0];

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and Longitude are required." },
      { status: 400 }
    );
  }

  // Fetch snowfall data from the Open Meteo API
  try {
    const url = `${OPEN_METEO_API}?latitude=${latitude}&longitude=${longitude}&daily=snowfall_sum&precipitation_unit=inch&timezone=America%2FDenver&start_date=${todaysDate}&end_date=${todaysDate}`;
    console.log("Fetching data from Open Meteo API:", url);

    const response = await fetch(url);
    console.log("Fetching: ", response);
    const data = await response.json();
    console.log("Data: ", data);

    if (!response.ok) {
      throw new Error(data.summary || "Failed to fetch data from Open Meteo API");
    }

    // Fetch 24-hour snowfall
    const results = data.daily.snowfall_sum.map(snowfall => parseFloat(snowfall).toFixed(1));
    if (results.length === 0) {
      return NextResponse.json({ results: "No data available" });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Server Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch snowfall data", details: error.message },
      { status: 500 }
    );
  }
}