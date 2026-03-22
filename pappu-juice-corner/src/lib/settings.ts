import connectDB from "./db";
import Settings, { ISettings } from "@/models/Settings";

/**
 * Retrieves global website settings from the database.
 * If no settings document exists, it creates one with default values.
 */
export async function getGlobalSettings(): Promise<ISettings> {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({}); // Creates default document
    }
    
    return settings;
  } catch (error) {
    console.error("Failed to fetch settings, falling back to defaults", error);
    // Return a dummy object matching the schema defaults if DB fails
    return {
      home: {
        heroTitle: "We Press. You Glow.",
        heroSubtitle: "Experience the pure vitality of cold-pressed, organic botanicals delivered straight to your door. No pasteurization. No compromises.",
      },
      about: {
        title: "Our Heritage",
        content: "Founded by a collective of farmers and nutritionists, Pappu Juice Corner began with a simple belief: nature's purest ingredients shouldn't be compromised by pasteurization or preservatives. Every bottle we craft reflects our commitment to soil health, seasonal harvesting, and maximum nutrient retention.",
        heroTitle: "Rooted in Nature. Crafted for You.",
      },
      contact: {
        email: "hello@pappujuice.com",
        phone: "+91 98765 43210",
        address: "120 Juice Lane, Fresh Market\nHyderabad, Telangana 500001",
        hours: "Mon – Sat: 6:00 AM – 10:00 PM\nSun: 7:00 AM – 9:00 PM",
      },
      delivery: {
        instantPrice: 5.50,
        superInstantPrice: 9.00,
        taxRate: 0.02,
      }
    } as any;
  }
}
