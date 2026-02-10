const mongoose = require("mongoose");
const { Schema } = mongoose;

const storeSummarySchema = new Schema(
  {
    date: { type: Date, required: true, index: true },    
    store_id: { type: String, required: true, index: true }, 
    kpis: {
      total_visitors: { type: Number, default: 0 },   
      total_revenue: { type: Number, default: 0 },   
      total_invoices: { type: Number, default: 0 },  
      conversion_rate: { type: Number, default: 0 },  
      avg_store_dwell_time: { type: Number, default: 0 }, 
      avg_basket_value: { type: Number, default: 0 }, 
    },
    realtime: {
      people_current: { type: Number, default: 0 },   
      checkout_length: { type: Number, default: 0 },  
    },
    chart_data: [
      {
        hour: Number, 
        people_count: Number, 
        total_revenue: Number, 
      },
    ],
    top_products: [
      {
        product_id: String,
        product_name: String,
        total_quantity: Number,
        total_revenue: Number,
        rank: Number,
      },
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: "storesummaries", 
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const StoreSummary = mongoose.model("StoreSummary", storeSummarySchema);

module.exports = StoreSummary;