const Inventory = require('../models/Inventory');

// Get all inventory items
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate('createdBy', 'name email')
      .sort({ receivedDate: -1 });
    
    res.json(inventory);
  } catch (err) {
    console.error('Get inventory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $or: [
        { status: 'low-stock' },
        { $expr: { $lte: ['$quantity', '$minimumStock'] } }
      ]
    })
      .populate('createdBy', 'name email')
      .sort({ quantity: 1 });
    
    res.json(lowStockItems);
  } catch (err) {
    console.error('Get low stock items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      quantity, 
      unit, 
      location, 
      minimumStock,
      donor,
      expiryDate,
      notes 
    } = req.body;
    
    if (!name || !description || !category || !quantity || !unit || !location || !minimumStock) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, description, category, quantity, unit, location, minimumStock' 
      });
    }

    const inventoryItem = new Inventory({
      name,
      description,
      category,
      quantity: parseInt(quantity),
      unit,
      location,
      minimumStock: parseInt(minimumStock),
      donor,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      notes,
      createdBy: req.user.id
    });

    await inventoryItem.save();
    await inventoryItem.populate('createdBy', 'name email');
    
    res.status(201).json(inventoryItem);
  } catch (err) {
    console.error('Create inventory item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key === 'quantity' || key === 'minimumStock') {
        inventoryItem[key] = parseInt(updateData[key]);
      } else if (key === 'expiryDate') {
        inventoryItem[key] = updateData[key] ? new Date(updateData[key]) : undefined;
      } else if (key === 'allocatedDate' || key === 'distributedDate') {
        inventoryItem[key] = updateData[key] ? new Date(updateData[key]) : undefined;
      } else {
        inventoryItem[key] = updateData[key];
      }
    });

    await inventoryItem.save();
    await inventoryItem.populate('createdBy', 'name email');

    res.json(inventoryItem);
  } catch (err) {
    console.error('Update inventory item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await Inventory.findByIdAndDelete(id);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Delete inventory item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Allocate inventory item
exports.allocateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { allocatedTo, quantity } = req.body;

    if (!allocatedTo || !quantity) {
      return res.status(400).json({ message: 'Please provide allocatedTo and quantity' });
    }

    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (inventoryItem.quantity < parseInt(quantity)) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    inventoryItem.allocatedTo = allocatedTo;
    inventoryItem.quantity -= parseInt(quantity);
    inventoryItem.allocatedDate = new Date();
    inventoryItem.status = 'allocated';

    await inventoryItem.save();
    await inventoryItem.populate('createdBy', 'name email');

    res.json(inventoryItem);
  } catch (err) {
    console.error('Allocate inventory item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload inventory item image
exports.uploadItemImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    inventoryItem.image = `/uploads/${req.file.filename}`;
    await inventoryItem.save();

    res.json({ 
      message: 'Image uploaded successfully',
      imagePath: inventoryItem.image
    });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
