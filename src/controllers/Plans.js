const Plans = require("../models/Plans");

exports.createPlan = async (req, res) => {
  const { plan, features } = req.body; // Expecting features as an array of feature IDs
  console.log("Request Body:", req.body); // Log the request body to debug
  try {
    let existingPlan = await Plans.findOne({ plan });

    if (existingPlan) {
      // Plan exists, check if each featureId is already present
      for (let featureId of features) {
        const featureExists = existingPlan.features.some(
          (feature) => feature.featureId.toString() === featureId
        );

        if (featureExists) {
          return res.status(200).json({
            success: false,
            message: "Feature already exists in the Plan",
          });
        } else {
          existingPlan.features.push({ featureId });
        }
      }

      await existingPlan.save();
      return res
        .status(200)
        .json({ success: true, message: "Features added to existing Plan" });
    } else {
      const newPlan = new Plans({
        plan,
        features: features.map((featureId) => ({ featureId })),
      });

      await newPlan.save();
      return res
        .status(200)
        .json({ success: true, message: "Successfully Plan Created" });
    }
  } catch (error) {
    console.error("Error creating plan:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPlanById = async (req, res) => {
  const { id } = req.params;
  try {
    // Populate featureId inside the features array
    const plan = await Plans.findById(id).populate("features.featureId");
    console.log(plan)
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan Not Found" });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// exports.updatePlan = async (req, res) => {
//   const { id } = req.params;
//   const { plan, featureId } = req.body;
//   try {
//     const planToUpdate = await Plans.findById(id);
//     if (!planToUpdate) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Plan Not Found" });
//     }
//     if (plan) {
//       planToUpdate.plan = plan;
//     }
//     if (featureId) {
//       // Check if featureId already exists in the plan
//       const featureExists = planToUpdate.features.some(
//         (feature) => feature.featureId.toString() === featureId
//       );
//       if (!featureExists) {
//         planToUpdate.features.push({ featureId });
//       }
//     }

//     // Save updated plan
//     const updatedPlan = await planToUpdate.save();

//     return res.status(200).json({
//       success: true,
//       message: "Plan Successfully Updated",
//       data: updatedPlan,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.updatePlan = async (req, res) => {
  const { id } = req.params;
  const { plan, featureIds } = req.body;

  try {
    const planToUpdate = await Plans.findById(id);
    if (!planToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Plan Not Found" });
    }

    if (plan) {
      planToUpdate.plan = plan;
    }

    if (featureIds && featureIds.length > 0) {
      featureIds.forEach((featureId) => {
        // Check if the featureId already exists in the plan
        const featureExists = planToUpdate.features.some(
          (feature) => feature.featureId.toString() === featureId
        );
        if (!featureExists) {
          planToUpdate.features.push({ featureId });
        }
      });
    }

    // Save updated plan
    const updatedPlan = await planToUpdate.save();

    return res.status(200).json({
      success: true,
      message: "Plan Successfully Updated",
      data: updatedPlan,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPlan = await Plans.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Plan Successfully Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteFeatureInPlan = async (req, res) => {
  const { id, featureId } = req.params;
  try {
    const plan = await Plans.findById(id);

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan Not Found" });
    }

    const featureIndex = plan.features.findIndex(
      (feature) => feature.featureId.toString() === featureId
    );

    if (featureIndex > -1) {
      plan.features.splice(featureIndex, 1);
      await plan.save();
      return res.status(200).json({
        success: true,
        message: "Feature Successfully Deleted from Plan",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Feature Not Found in Plan" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

//getAllplans
exports.getAllplans = async (req, res) => {
  try {
    const plan = await Plans.find();
    return res.status(201).json({ success: true, plan });
  } catch (error) {
    return res.status(401).json({ success: false, error });
  }
};