import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latitude = parseFloat(searchParams.get("latitude"));
  const longitude = parseFloat(searchParams.get("longitude"));
  const currentDate = new Date();
  const today = currentDate.getDate();

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and Longitude are required." },
      { status: 400 }
    );
  }

  // Always subtract 2 days from today's date
  const dayToCheck = today - 1;
  console.log("Adjusted day to check (always 2 days behind):", dayToCheck);

  // Handle edge case for the first two days of the month
  const currentMonthYear = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const previousMonthYear =
    currentDate.getMonth() === 0
      ? `${currentDate.getFullYear() - 1}12`
      : `${currentDate.getFullYear()}${String(currentDate.getMonth()).padStart(2, "0")}`;
  const monthYearToFetch = dayToCheck <= 0 ? previousMonthYear : currentMonthYear;

  const NOAA_BASE_URL = "https://www.ncei.noaa.gov/access/monitoring/daily-snow";
  const datasetUrl = `${NOAA_BASE_URL}/CO-snowfall-${monthYearToFetch}.json`;

  let snowfallData = null;

  try {
    const response = await fetch(datasetUrl);
    if (response.ok) {
      snowfallData = await response.json();
    } else {
      return NextResponse.json(
        { error: "Failed to fetch NOAA dataset." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching NOAA dataset:", error);
    return NextResponse.json(
      { error: "Error fetching NOAA dataset.", details: error.message },
      { status: 500 }
    );
  }

  // Find closest stations
  const closestStations = Object.values(snowfallData.data)
    .map((station) => ({
      ...station,
      distance: calculateDistance(latitude, longitude, parseFloat(station.lat), parseFloat(station.lon)),
    }))
    .sort((a, b) => a.distance - b.distance);

  console.log("Closest Stations:", closestStations);

  // Check snowfall for the adjusted day
  let snowfallInfo = null;

  for (const station of closestStations) {
    const adjustedDayToCheck = dayToCheck <= 0 ? 31 + dayToCheck : dayToCheck; // Handle previous month's last days
    const snowfall = station.values?.[String(adjustedDayToCheck)] || "M";
    console.log(`Station: ${station.station_name}, Snowfall for day ${adjustedDayToCheck}:`, snowfall);

    if (snowfall !== "M" && snowfall !== "T") {
      snowfallInfo = {
        station: station.station_name,
        lat: station.lat,
        lon: station.lon,
        distance: station.distance,
        snowfall: `${snowfall} inches`,
      };
      break;
    }
  }

  if (snowfallInfo) {
    return NextResponse.json(snowfallInfo);
  } else {
    return NextResponse.json({
      message: `No snowfall data available for ${
        dayToCheck <= 0 ? "the last day of the previous month" : "2 days ago"
      }.`,
    });
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}