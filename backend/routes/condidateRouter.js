const express = require("express");
const logger = require("../utils/logger");

const router = express.Router();
const {
  createCandidate,
  getAllCandidates,
  // getCandidateById,
  getCandidateByCandidateId,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/condidateController");

// Route to create a new candidate
router.post("/", async (req, res) => {
  try {
    const savedCandidate = await createCandidate(req.body);
    res.status(201).json(savedCandidate);
  } catch (error) {
    res.status(500).json({ message: "Error creating candidate", error });
  }
});

// Route to get all candidates
router.get("/", async (req, res) => {
  try {
    const candidates = await getAllCandidates();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving candidates", error });
  }
});

// Route to get a candidate by ID
router.get("/:id", async (req, res) => {
  try {
    const candidate = await getCandidateByCandidateId(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving candidate", error });
  }
});

// Route to update a candidate by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedCandidate = await updateCandidate(req.params.id, req.body);
    if (!updatedCandidate) {
      return res
        .status(404)
        .json({ message: "Candidate not found for update" });
    }
    res.status(200).json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ message: "Error updating candidate", error });
  }
});

// Route to delete a candidate by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCandidate = await deleteCandidate(req.params.id);
    if (!deletedCandidate) {
      return res
        .status(404)
        .json({ message: "Candidate not found for deletion" });
    }
    res.status(200).json({ message: "Candidate deleted", deletedCandidate });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidate", error });
  }
});

// Route to log transactions
router.post("/logTransaction", async (req, res) => {
  try {
    const { candidateId, transactionHash, blockNumber, gasUsed } = req.body;

    logger.info(
      `Candidate Transaction - ID: ${candidateId}, Tx Hash: ${transactionHash}, Block Number: ${blockNumber}, Gas Used: ${gasUsed}`
    );
    res.status(200).json({ message: "Transaction logged" });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving candidates", error });
  }
});

module.exports = router;
