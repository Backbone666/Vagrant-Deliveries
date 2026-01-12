import axios from "axios";

const ESI_BASE = "https://esi.evetech.net/latest";

export const esi = {
  async getSystemID(name: string): Promise<number | null> {
    try {
      const res = await axios.get(`${ESI_BASE}/search/`, {
        params: {
          categories: "solar_system",
          search: name,
          strict: true
        }
      });
      return res.data.solar_system ? res.data.solar_system[0] : null;
    } catch (error) {
      console.error(`ESI Search Error for ${name}:`, error);
      return null;
    }
  },

  async getRoute(originId: number, destId: number, preference: "secure" | "shortest" | "insecure" = "secure"): Promise<number[]> {
    try {
      const res = await axios.get<number[]>(`${ESI_BASE}/route/${originId}/${destId}/`, {
        params: {
          flag: preference
        }
      });
      return res.data;
    } catch (error) {
      console.error(`ESI Route Error ${originId}->${destId}:`, error);
      return [];
    }
  },

  async getJumps(origin: string, destination: string, preference: "secure" | "shortest" | "insecure" = "secure"): Promise<number> {
    const originId = await this.getSystemID(origin);
    const destId = await this.getSystemID(destination);

    if (!originId || !destId) {
      throw new Error("Invalid system name");
    }

    const route = await this.getRoute(originId, destId, preference);
    return Math.max(0, route.length - 1);
  }
}