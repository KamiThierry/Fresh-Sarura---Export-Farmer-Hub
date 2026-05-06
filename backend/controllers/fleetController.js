import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

// ── VEHICLES ──────────────────────────────────────────────────────────────────

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 }).lean();
    const drivers = await Driver.find({ assignedVehicle: { $ne: null } }).lean();
    
    // Map drivers to vehicles for the UI's 'currentDriver' field
    const vehiclesWithDrivers = vehicles.map(v => {
      const driver = drivers.find(d => d.assignedVehicle?.toString() === v._id.toString());
      return { ...v, currentDriver: driver || null };
    });

    res.json({ status: 'success', data: vehiclesWithDrivers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vehicles', error: err.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ status: 'success', data: vehicle });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create vehicle', error: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ status: 'success', data: vehicle });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update vehicle', error: err.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete vehicle', error: err.message });
  }
};

// ── DRIVERS ───────────────────────────────────────────────────────────────────

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('assignedVehicle', 'plateNumber type').sort({ createdAt: -1 });
    res.json({ status: 'success', data: drivers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drivers', error: err.message });
  }
};

export const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({ status: 'success', data: driver });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create driver', error: err.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedVehicle', 'plateNumber type');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ status: 'success', data: driver });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update driver', error: err.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete driver', error: err.message });
  }
};

// ── ASSIGN VEHICLE TO DRIVER ─────────────────────────────────────────────────

export const assignVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { assignedVehicle: vehicleId || null },
      { new: true }
    ).populate('assignedVehicle', 'plateNumber type');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ status: 'success', data: driver });
  } catch (err) {
    res.status(400).json({ message: 'Failed to assign vehicle', error: err.message });
  }
};
