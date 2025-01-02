import { NextResponse } from "next/server";

const GOOGLE_MAPS_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");

  // 1. Validate input parameters
  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude & Longtitude Required" },
      { status: 400 }
    );
  }

  try {
    // 2. Construct the Google Maps API URL
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `${GOOGLE_MAPS_API_URL}?latlng=${encodeURIComponent(`${latitude}, ${longitude}`)}&key=${apiKey}`;

    // 3. Make the API call
    const response = await fetch(url);
    const data = await response.json();

    // 4. Handle errors from the Google API
    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Google Maps API error: ${data.status}`, message: data.error_message },
        { status: 500 }
      );
    }

    // 5. Extract transit time from the response
    if (!data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: "No results found for the specified coordinates." },
        { status: 404 }
      );
    }

    const address = data.results[0].formatted_address || "Unavailable";

    // 6. Log for debugging
    console.log(
      `[Google API] Address: ${address} | Latitude: ${latitude}, Longitude: ${longitude}`
    );

    // 7. Return the address
    return NextResponse.json({ address });
  } catch (error) {
    // 8. Handle unexpected errors
    return NextResponse.json(
      { error: "Failed to fetch address", details: error.message },
      { status: 500 }
    );
  }
}