import { esi } from "./esi.js";

export interface PricingRequest {
  origin: string;
  destination: string;
  volume: number;
  collateral: number;
  routeType: "highsec" | "lowsec" | "providence" | "zarzakh" | "thera";
}

export interface PricingResult {
  price: number;
  jumps: number;
  breakdown: string;
  valid: boolean;
  error?: string;
}

const MIN_REWARD = 4_500_000;

export const pricing = {
  async calculate(req: PricingRequest): Promise<PricingResult> {
    let jumps = 0;
    let ratePerJump = 0;
    let collateralSurcharge = 0;

    try {
      // Route Calculation
      let preference: "secure" | "shortest" = "secure";
      if (["lowsec", "providence", "zarzakh", "thera"].includes(req.routeType)) {
        preference = "shortest";
      }

      jumps = await esi.getJumps(req.origin, req.destination, preference);

      // Rate Determination (Simplified VGLGI Logic)
      if (req.routeType === "highsec") {
        // HighSec Rates
        if (req.volume <= 62_500) { // DST/BR
          ratePerJump = 1_500_000;
        } else if (req.volume <= 340_000) { // Freighter
          ratePerJump = 2_250_000;
        } else { // JF/Heavy
          ratePerJump = 3_000_000;
        }

        // Collateral
        if (req.collateral > 1_000_000_000) {
          collateralSurcharge = (req.collateral - 1_000_000_000) * 0.01; // 1% over 1B
        }

      } else if (req.routeType === "providence") {
        // Provi-Block special rates
        ratePerJump = 3_000_000;
        collateralSurcharge = req.collateral * 0.02;

      } else {
        // Default Dangerous
        ratePerJump = 5_000_000;
        collateralSurcharge = req.collateral * 0.03;
      }

      // Final Calc
      let price = (jumps * ratePerJump) + collateralSurcharge;

      if (price < MIN_REWARD) price = MIN_REWARD;

      return {
        price,
        jumps,
        breakdown: `${jumps} jumps @ ${(ratePerJump / 1_000_000).toFixed(2)}M/j + Collateral Fee: ${(collateralSurcharge / 1_000_000).toFixed(2)}M`,
        valid: true
      };

    } catch (e) {
      const error = e as Error;
      return { price: 0, jumps: 0, breakdown: "Error", valid: false, error: error.message };
    }
  }
};