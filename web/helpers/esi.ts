import axios from "axios";

const ESI_BASE = "https://esi.evetech.net/latest";

export const esi = {
  async getSystemID(name: string): Promise<number | null> {
    console.log(`ESI: Looking up ID for system: "${name}"`);
    try {
      const res = await axios.post(`${ESI_BASE}/universe/ids/`, [name]);
      const id = res.data.systems ? res.data.systems[0].id : null;
      console.log(`ESI: Found ID for "${name}": ${id}`);
      return id;
    } catch (error) {
      console.error(`ESI Lookup Error for ${name}:`, error);
      return null;
    }
  },

  async getRoute(
    originId: number,
    destId: number,
    preference: "secure" | "shortest" | "insecure" = "secure",
  ): Promise<number[]> {
    try {
      const res = await axios.get<number[]>(
        `${ESI_BASE}/route/${originId}/${destId}/`,
        {
          params: {
            flag: preference,
          },
        },
      );
      return res.data;
    } catch (error) {
      console.error(`ESI Route Error ${originId}->${destId}:`, error);
      return [];
    }
  },

  async getJumps(
    origin: string,
    destination: string,
    preference: "secure" | "shortest" | "insecure" = "secure",
  ): Promise<number> {
    const originId = await this.getSystemID(origin);
    const destId = await this.getSystemID(destination);

    if (!originId || !destId) {
      throw new Error("Invalid system name");
    }

    const route = await this.getRoute(originId, destId, preference);
    return Math.max(0, route.length - 1);
  },
};
