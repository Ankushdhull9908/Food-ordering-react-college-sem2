import mongoose from "mongoose";
  export const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    phone: {
        type: String,
        required: true,
        unique:true
    }
});


export const cartschema = new mongoose.Schema({
  
    itemId:{
        type:Number,
        required:true
    },
  restaurantid:{
        type:Number,
        required:true
  },
    itemName :{
        type:String,
        required: true
    },
    itemImage:{
        type:String,
        required:true
    },itemQuantity:{
      type:Number,
      required: true
    },
    itemPrice :{
      type:Number,
      required: true
    },
    itemType:{
      type:String,
      required:true,
    },
    ownerPhone:{
      type:String,
      required: true
    }
})


export const Orders = new mongoose.Schema({
  orderId:{
    type:Number,
    required:true,
  },
  orderData: {
    type: [{ 
      itemId: Number, 
      itemImage: String, 
      itemName: String, 
      itemPrice: Number, 
      itemQuantity: Number, 
      restaurantid: Number 
    }], 
    required: true
  },
  restaurantId:{
    type:Number,
    required:true,
  },
  ownerPhone:{
    type:String,
    required: true
  },
  orderStatus:{
    type:String,
    required:true
  },
  
  Date:{
    type:String,
    required:true
  },
  TotalAmount:{
    type:Number,
    required:true
  }

})


const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true }
});

export const restaurantSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5 },
  deliveryTime: String,
  Distance: { type: Number, default: null },
  image: { type: String, required: true },
  location: { type: locationSchema, required: true },
  menu: { type: [Number], default: [] }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add indexes for better query performance







