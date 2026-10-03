import mongoose, { Schema, Document } from "mongoose";

export interface ICrop extends Document {
  userId: string;
  cropType: string;
  location: string;
  farmSize: number;
  sowingMonth: string;
  
  // Flattened form Inputs
  irrigationType?: string;
  irrigationFrequency?: string;
  fertilizer?: string;
  pesticide?: string;
  seedVariety?: string;
  farmingType?: string;

  // Flattened Prediction Output fields
  predictedYield?: number;
  yieldRange?: {
    min: number;
    max: number;
  };
  riskLevel?: string;
  confidence?: string;
  recommendations?: { text: string; priority: string }[];
  factors?: { name: string; impact: string }[];
  weather?: {
    temperature: string;
    rainfall: string;
    humidity: string;
  };
  
  status?: "active" | "retired";
  createdAt: Date;
}

const CropSchema: Schema = new Schema({
  userId: { type: String, required: true },
  cropType: { type: String, required: true },
  location: { type: String, required: true },
  farmSize: { type: Number, required: true },
  sowingMonth: { type: String, required: true },
  
  // Flat Inputs
  irrigationType: { type: String },
  irrigationFrequency: { type: String },
  fertilizer: { type: String },
  pesticide: { type: String },
  seedVariety: { type: String },
  farmingType: { type: String },
  
  // Flat AI Result Outputs
  predictedYield: { type: Number },
  yieldRange: {
    min: { type: Number },
    max: { type: Number },
  },
  riskLevel: { type: String },
  confidence: { type: String },
  recommendations: [{
    text: { type: String },
    priority: { type: String }
  }],
  factors: [{
    name: { type: String },
    impact: { type: String }
  }],
  weather: {
    temperature: { type: String },
    rainfall: { type: String },
    humidity: { type: String }
  },

  status: { type: String, enum: ["active", "retired"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

// Avoid re-compilation error in Next.js development
export const Crop = mongoose.models.Crop || mongoose.model<ICrop>("Crop", CropSchema);
