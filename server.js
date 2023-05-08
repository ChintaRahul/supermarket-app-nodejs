const express = require("express");
const mongoose = require("mongoose");
const groceryListData = require("./data/groceryList.json");
const app = express();
const cors = require("cors");
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const uri = "mongodb://127.0.0.1:27017/shopmaker-app";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const groceryListSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: String,
  imgUrl: String,
  discount: Number,
});

const GroceryList = new mongoose.model("grocerylists", groceryListSchema);

const cartItemListSchema = new mongoose.Schema({
  cartItems: [Object],
  totalAmount: Number,
  totalItems: Number,
});

const CartItemLists = new mongoose.model("cartitemlists", cartItemListSchema);

GroceryList.count().then((count) => {
  if (count == 0) {
    GroceryList.insertMany(groceryListData.groceryList)
      .then(() => console.log("successfuly saved default grocery list to DB."))
      .catch((err) => console.log(`Error occurred while inital import ${err}`));
    CartItemLists.deleteMany({});
    CartItemLists.insertMany([{cartItems:[], totalItems:0, totalAmount:0}]);
  }
});

app.get("/grocery-list", async(req, res) => {
  try{
    const groceryListData = await GroceryList.find();
    const cart = await CartItemLists.find();
    res.json({ groceryList: groceryListData, cart });
  }catch(err) {
    res.status(500).send("an error occured.")
  }
});

app.post("/cart-items", async (req, res) => {
  await CartItemLists.findOneAndUpdate(
    {_id: req.body._id},
    req.body,
    { upsert: true }
  );
  res.send();
});

app.listen(3002, () => console.log("Server 🚀 started on port 3002 "));
