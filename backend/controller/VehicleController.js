const Vehicle = require ('../model/Vehicle');



const getVehicle = async (req, res) => {
    try {
        const { V_Id } = req.params; 
        const vehicle = await Vehicle.findOne({ V_Id: V_Id });

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const addVehicle = async (req, res) => {
    try {
        const { B_Id, modelName, seats, fuelType, transmission, doors, status, priceDay, priceMonth ,userId} = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        // Create new vehicle
        const vehicle = new Vehicle({
            B_Id,
            modelName,
            seats,
            fuelType,
            transmission,
            doors,
            status,
            priceDay,
            priceMonth,
            image: {
                data: req.file.buffer, // Store binary data
                contentType: req.file.mimetype
            },
            userId
        });

        await vehicle.save();
        res.status(201).json({ message: "Vehicle added successfully", vehicle });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = { ...req.body };

     
        if (req.file) {
            updateData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        // Update the vehicle based on V_Id
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { V_Id: id },  // Query by V_Id instead of _id
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.status(200).json({ message: "Vehicle updated successfully", updatedVehicle });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



const getAllVehicleByUserId = async (req, res) => {    

    try {
        const vehicles = await Vehicle.find({userId:req.query.userId});

        // Convert image buffer to Base64
        const vehiclesWithImages = vehicles.map(vehicle => ({
            _id: vehicle._id,
            V_Id: vehicle.V_Id,
            B_Id: vehicle.B_Id,
            modelName: vehicle.modelName,
            seats: vehicle.seats,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            doors: vehicle.doors,
            status: vehicle.status,
            priceDay: vehicle.priceDay,
            priceMonth: vehicle.priceMonth,
            image: vehicle.image 
                ? `data:${vehicle.image.contentType};base64,${vehicle.image.data.toString("base64")}` 
                : null,
        }));

        res.status(200).json(vehiclesWithImages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};


const getAllVehicle = async (req, res) => {    

    try {
        const vehicles = await Vehicle.find({});

        // Convert image buffer to Base64
        const vehiclesWithImages = vehicles.map(vehicle => ({
            _id: vehicle._id,
            V_Id: vehicle.V_Id,
            B_Id: vehicle.B_Id,
            modelName: vehicle.modelName,
            seats: vehicle.seats,
            fuelType: vehicle.fuelType,
            transmission: vehicle.transmission,
            doors: vehicle.doors,
            status: vehicle.status,
            priceDay: vehicle.priceDay,
            priceMonth: vehicle.priceMonth,
            image: vehicle.image 
                ? `data:${vehicle.image.contentType};base64,${vehicle.image.data.toString("base64")}` 
                : null,
        }));

        res.status(200).json(vehiclesWithImages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const deleteVehicle = async (req,res) => {
    const V_Id = req.params.id;  
    try{
        const deleteVehicle = await Vehicle.findOneAndDelete({ V_Id: V_Id });
        res.status(200).json(deleteVehicle);
    }catch(error){
        res.status(500).json({message:error.message});
    }
}

module.exports = {
    getAllVehicle,
    getVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getAllVehicleByUserId
};