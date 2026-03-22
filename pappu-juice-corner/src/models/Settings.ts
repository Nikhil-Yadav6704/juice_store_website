import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  home: {
    heroTitle: string;
    heroSubtitle: string;
  };
  about: {
    title: string;
    content: string;
    heroTitle: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  delivery: {
    instantPrice: number;
    superInstantPrice: number;
    taxRate: number;
  };
}

const SettingsSchema: Schema = new Schema(
  {
    home: {
      heroTitle: { type: String, default: "We Press. You Glow." },
      heroSubtitle: { type: String, default: "Experience the pure vitality of cold-pressed, organic botanicals delivered straight to your door. No pasteurization. No compromises." }
    },
    about: {
      title: { type: String, default: "Our Heritage" },
      content: { type: String, default: "Founded by a collective of farmers and nutritionists, Pappu Juice Corner began with a simple belief: nature's purest ingredients shouldn't be compromised by pasteurization or preservatives. Every bottle we craft reflects our commitment to soil health, seasonal harvesting, and maximum nutrient retention." },
      heroTitle: { type: String, default: "Rooted in Nature. Crafted for You." }
    },
    contact: {
      email: { type: String, default: "hello@pappujuice.com" },
      phone: { type: String, default: "+91 98765 43210" },
      address: { type: String, default: "120 Juice Lane, Fresh Market\\nHyderabad, Telangana 500001" },
      hours: { type: String, default: "Mon – Sat: 6:00 AM – 10:00 PM\\nSun: 7:00 AM – 9:00 PM" }
    },
    delivery: {
      instantPrice: { type: Number, default: 5.50 },
      superInstantPrice: { type: Number, default: 9.00 },
      taxRate: { type: Number, default: 0.02 }
    }
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
