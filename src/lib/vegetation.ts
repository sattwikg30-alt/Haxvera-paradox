/**
 * Vegetation Satellite Data Helper
 * Uses Open-Meteo VHR (Very High Resolution) Satellite Data
 * For NDVI (Normalized Difference Vegetation Index)
 */

export interface VegetationData {
  ndvi: number | null;
  health: "Healthy" | "Moderate" | "Low" | "Unknown";
  confidence: "High" | "Medium" | "Low";
  source: string;
}

/**
 * Fetch NDVI vegetation index for given coordinates
 */
export async function getNDVI(lat: number, lon: number): Promise<VegetationData> {
  const fallback: VegetationData = {
    ndvi: null,
    health: "Unknown",
    confidence: "Low",
    source: "Fallback (Satellite API failure)"
  };

  try {
    // Note: Open-Meteo has a specific VHR Satellite API for NDVI
    // Using the terrestrial data API endpoint which provides NDVI indices
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=ndvi&timezone=auto`;
    
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      console.warn(`NDVI API returned status: ${response.status}`);
      return fallback;
    }

    const data = await response.json();
    
    // Extract NDVI from daily results
    // Open-Meteo daily NDVI usually returns an array of values for the week
    const ndviValue = data.daily?.ndvi?.[0];

    if (ndviValue === undefined || ndviValue === null) {
      return fallback;
    }

    // NDVI Classification:
    // > 0.6: Healthy
    // 0.3 - 0.6: Moderate
    // < 0.3: Low
    let health: "Healthy" | "Moderate" | "Low" | "Unknown" = "Unknown";
    if (ndviValue > 0.6) health = "Healthy";
    else if (ndviValue >= 0.3) health = "Moderate";
    else health = "Low";

    return {
      ndvi: Math.round(ndviValue * 100) / 100,
      health,
      confidence: "High",
      source: "Open-Meteo VHR Satellite"
    };

  } catch (error) {
    console.error("NDVI fetch error:", error);
    return fallback;
  }
}