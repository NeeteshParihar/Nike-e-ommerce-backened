
import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' }, // Link to Product
  sku: { type: Schema.Types.ObjectId, ref: 'SKU' },         // Context for which size/color was bought
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
});

const ReviewModel = model('Review', reviewSchema);
export default ReviewModel;
