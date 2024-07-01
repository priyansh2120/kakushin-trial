import verifySecretKey from "../middleware/verifySecretkeychores.js";
import User from "../models/user.model.js";
import Chore from "../models/chore.model.js";
import bcrypt from "bcryptjs";

export const generateSecretKey = async (req, res) => {
  try {
    const { userId, secretKey } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the secret key
    const hashedSecretKey = await bcrypt.hash(secretKey, 10);

    // Update the user with the hashed secret key
    user.parentSecretKey = hashedSecretKey;
    await user.save();

    res
      .status(200)
      .json({ message: "Secret key generated and stored successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addChore = async (req, res) => {
  try {
    const { userId, description, addedByParent, secretKey } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify if the request is made by a parent and validate the secret key if so
    if (addedByParent) {
      if (!secretKey) {
        return res
          .status(400)
          .json({ message: "Secret key required for parent-added chores" });
      }

      req.body.secretKey = secretKey;
      verifySecretKey(req, res, async () => {
        const chore = new Chore({
          userId,
          description,
          addedByParent,
          addedBy: user._id,
        });

        await chore.save();
        res.status(201).json(chore);
      });
    } else {
      const chore = new Chore({
        userId,
        description,
        addedByParent,
        addedBy: user._id,
      });

      await chore.save();
      res.status(201).json(chore);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const completeChore = async (req, res) => {
  try {
    const { choreId } = req.params;
    const { userId, secretKey } = req.body;
    const user = await User.findById(userId);
    // Find the existing chore
    const chore = await Chore.findById(choreId);
    if (!chore) {
      return res.status(404).json({ message: "Chore not found" });
    }

    // Verify if the chore is added by a parent and validate the secret key if so
    if (chore.addedByParent) {
      if (!secretKey) {
        return res.status(400).json({
          message: "Secret key required for completing parent-added chores",
        });
      }

      req.body.secretKey = secretKey;
      verifySecretKey(req, res, async () => {
        chore.isCompleted = true;
        chore.dateCompleted = new Date();
        user.virtualCurrency+=10;
        await user.save();
        await chore.save();
        res.json(chore);
      });
    } else {
      chore.isCompleted = true;
      chore.dateCompleted = new Date();
      user.virtualCurrency+=5;
      await chore.save();
      await user.save();
      res.json(chore);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getChores = async (req, res) => {
  try {
    const { userId } = req.params;
    const chores = await Chore.find({ userId });
    res.json(chores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
