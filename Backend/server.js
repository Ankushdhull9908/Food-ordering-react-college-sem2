import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './Mongodbconnection.js'; // Adjust path as needed
import { userSchema, cartschema, Orders,restaurantSchema } from "./Schemas.js";
import dotenv from 'dotenv';

// Initialize Express
const app = express();
const PORT = process.env.port;

// Configure paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({ 
    origin: "http://localhost:3000", 
    credentials: true 
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend/build')));

// Database Models
const User = mongoose.model("userdata", userSchema);
const Cart = mongoose.model("cart", cartschema);
const Order = mongoose.model("orders", Orders);
const Restaurants = mongoose.model("restaurants",restaurantSchema)

// ======================
// Database Connection
// ======================
let dbConnected = false;

// Middleware to check DB connection
const checkDBConnection = (req, res, next) => {
    if (!dbConnected) {
        return res.status(503).json({ 
            message: 'Database not connected. Please try again later.' 
        });
    }
    next();
};

// ======================
// Routes
// ======================

// Signup Route
app.post('/signup', checkDBConnection, async (req, res) => {
    const { name, email, phone } = req.body;
    
    if (!email || !name || !phone) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const newUser = new User({ name, email, phone });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/displayCart/:ownerPhone', async (req, res) => {

    const {ownerPhone} = req.params
    
    try {
        const cartItems = await Cart.find({ownerPhone:ownerPhone}); // Fetch cart items from the database
        res.json(cartItems); // Send the cart items as JSON
    } catch (error) {
        res.status(500).json({ error: error.message }); // Send error as JSON
    }
});

// Login Route
app.post('/login', checkDBConnection, async (req, res) => {
    const { phone } = req.body;

    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ 
            message: 'Login successful',
            user: { 
                name: user.name, 
                email: user.email,
                phone: user.phone 
            } 
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cart Routes
app.get('/api/cartitems', checkDBConnection, async (req, res) => {
    try {
        const items = await Cart.find();
        res.json(items);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: error.message });
    }
});


app.get('/allorders/:ownerPhone', checkDBConnection, async (req, res) => {
    const {ownerPhone} = req.params
    try {
        const items = await Order.find({ownerPhone:ownerPhone});
        
        res.json(items);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/restaurants',async (req,res)=>{

    try{

        var result = await Restaurants.find()
        res.json(result)
       
    }catch(error)
    {

    }
    
})

app.post('/addToCart', checkDBConnection, async (req, res) => {
    const { itemId, restaurantid, itemName, itemImage, itemQuantity, itemPrice,itemType, ownerPhone } = req.body;

    try {
        const existingItem = await Cart.findOne({ itemId, ownerPhone });

        if (existingItem) {
            existingItem.itemQuantity += 1;
            await existingItem.save();
            return res.status(200).json({ 
                message: 'Item quantity updated', 
                quantity: existingItem.itemQuantity 
            });
        } else {
            const cartItem = new Cart({
                
                itemId,
                restaurantid,
                itemName,
                itemImage,
                itemQuantity: itemQuantity || 1,
                itemPrice,
                itemType,
                ownerPhone
            });
            
            await cartItem.save();
            return res.status(201).json({ 
                message: 'Item added to cart', 
                quantity: cartItem.itemQuantity 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to add item', 
            details: error.message 
        });
    }
});


app.post("/placeorder", async (req, res) => {
    try {
      const newOrder = new Order(req.body);
      await newOrder.save();
      res.json({ message: "Order placed successfully!" });
    } catch (error) {
      console.error("Error saving order:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });



// Quantity Management Routes
app.post('/minsCartQuantity', checkDBConnection, async (req, res) => {
    const { itemId, ownerPhone } = req.body;

    try {
        const existingItem = await Cart.findOne({ itemId, ownerPhone });

        if (!existingItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (existingItem.itemQuantity > 1) {
            existingItem.itemQuantity -= 1;
            await existingItem.save();
            res.json({ message: "Quantity decreased", item: existingItem });
        } else {
            await Cart.deleteOne({ itemId, ownerPhone });
            res.json({ message: "Item removed" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

app.post('/plusCartQuantity', checkDBConnection, async (req, res) => {
    const { itemId, ownerPhone } = req.body;
    
    try {
        const existingItem = await Cart.findOne({ itemId, ownerPhone });
        
        if (existingItem) {
            existingItem.itemQuantity += 1;
            await existingItem.save();
            res.json({ message: "Quantity increased", item: existingItem });
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Empty Cart Route
app.post('/emptycart', checkDBConnection, async (req, res) => {
    const { resid, phone } = req.body;
    
    try {
        await Cart.deleteMany({ restaurantid: resid, ownerPhone: phone });
        res.json({ message: "Cart emptied" });
    } catch (error) {
        res.status(500).json({ message: "Error emptying cart", error });
    }
});



// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
});

// ======================
// Server Startup
// ======================
const startServer = async () => {
    try {
        await connectDB();
        dbConnected = true;
        console.log('✅ Database connection established');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};


startServer();