const express = require("express");
const logger = require("../utils/logger");

const router = express.Router();
const {
  createVoter,
  getAllVoters,
  getVoterById,
  getVoterByVoterId,
  updateVoter,
  deleteVoter,
} = require("../controllers/votersController");

// Route to create a new voter
router.post("/", async (req, res) => {
  try {
    const savedVoter = await createVoter(req.body);
    res.status(201).json(savedVoter);
  } catch (error) {
    res.status(500).json({ message: "Error creating voter", error });
  }
});

// Route to get all voters
router.get("/", async (req, res) => {
  try {
    const voters = await getAllVoters();
    res.status(200).json(voters);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving voters", error });
  }
});

// Route to get a voter by ID
router.get("/:id", async (req, res) => {
  try {
    const voter = await getVoterByVoterId(req.params.id);
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }
    res.status(200).json(voter);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving voter", error });
  }
});

// Route to get a voter by ID
router.get("/exists/:id", async (req, res) => {
  try {
    const voter = await getVoterByVoterId(req.params.id);
    if (!voter) {
      return res
        .status(200)
        .json({ message: "Voter not found", exists: false });
    }
    res.status(200).json({ message: "Voter found", exists: true });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving voter", error });
  }
});

// Route to update a voter by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedVoter = await updateVoter(req.params.id, req.body);
    if (!updatedVoter) {
      return res.status(404).json({ message: "Voter not found for update" });
    }
    res.status(200).json(updatedVoter);
  } catch (error) {
    res.status(500).json({ message: "Error updating voter", error });
  }
});

// Route to delete a voter by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedVoter = await deleteVoter(req.params.id);
    if (!deletedVoter) {
      return res.status(404).json({ message: "Voter not found for deletion" });
    }
    res.status(200).json({ message: "Voter deleted", deletedVoter });
  } catch (error) {
    res.status(500).json({ message: "Error deleting voter", error });
  }
});

// Route to log transactions
router.post("/logTransaction", async (req, res) => {
  try {
    const { voterId, transactionHash, blockNumber, gasUsed } = req.body;

    logger.info(
      `Voter Transaction - ID: ${voterId}, Tx Hash: ${transactionHash}, Block Number: ${blockNumber}, Gas Used: ${gasUsed}`
    );
    res.status(200).json({ message: "Transaction logged" });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving voter", error });
  }
});

module.exports = router;
