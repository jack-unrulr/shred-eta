import { NextResponse } from "next/server";

const GOOGLE_MAPS_API_URL = "https://maps.googleapis.com/maps/api/directions/json";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get("origin");
  const resortAddress = searchParams.get("destination");

  // 1. Validate input parameters
  if (!userAddress || !resortAddress) {
    return NextResponse.json(
      { error: "Both 'userAddress' and 'resortAddress' are required." },
      { status: 400 }
    );
  }

  try {
    // 2. Construct the Google Maps API URL
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `${GOOGLE_MAPS_API_URL}?origin=${encodeURIComponent(
      userAddress
    )}&destination=${encodeURIComponent(resortAddress)}&key=${apiKey}`;

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
    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: "No routes found between the specified addresses." },
        { status: 404 }
      );
    }

    const transitTime = data.routes[0]?.legs[0]?.duration?.text || "Unavailable";

    // 6. Log for debugging
    console.log(
      `[Google API] Transit time: ${transitTime} | Origin: ${userAddress}, Destination: ${resortAddress}`
    );

    // 7. Return the transit time
    return NextResponse.json({ transitTime });
  } catch (error) {
    // 8. Handle unexpected errors
    return NextResponse.json(
      { error: "Failed to fetch transit time", details: error.message },
      { status: 500 }
    );
  }
}