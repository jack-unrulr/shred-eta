import { NextResponse } from "next/server";

const GOOGLE_AUTOCOMPLETE_API_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ error: "Input query parameter is required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Ensure this is set in your .env.local
    const url = `${GOOGLE_AUTOCOMPLETE_API_URL}?input=${encodeURIComponent(
      input
    )}&key=${apiKey}&types=address`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Google API error: ${data.error_message || "Unknown error"}`);
    }

    return NextResponse.json(data); // Return predictions directly to the client
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch autocomplete data", details: error.message },
      { status: 500 }
    );
  }
}