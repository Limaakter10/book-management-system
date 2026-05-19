export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    res.json({
      success: true,
      orders
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to fetch order"
    });
  }
};