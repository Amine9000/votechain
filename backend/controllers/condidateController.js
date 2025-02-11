const Candidate = require("../schemas/condidate"); // Adjust the path as needed
const logger = require("../utils/logger");

// Create a new candidate
const createCandidate = async (candidateData) => {
  try {
    const newCandidate = new Candidate(candidateData);
    const savedCandidate = await newCandidate.save();
    logger.info(
      `Candidate Created - Name: ${savedCandidate.name}, Party: ${savedCandidate.party}, Constituency: ${savedCandidate.constituency}, Candidate ID: ${savedCandidate.candidateId}`
    );
    return savedCandidate;
  } catch (error) {
    logger.error("Error creating candidate:", error.message);
    throw error;
  }
};

// Read all candidates
const getAllCandidates = async () => {
  try {
    const candidates = await Candidate.find();
    logger.info(`Retrieved ${candidates.length} candidates.`);
    return candidates;
  } catch (error) {
    logger.error(`Error retrieving candidates: ${error.message}`);
    throw error;
  }
};

// Read a candidate by ID
const getCandidateById = async (candidateId) => {
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      console.log("Candidate not found");
      return null;
    }
    console.log("Candidate details:", candidate);
    return candidate;
  } catch (error) {
    console.error("Error retrieving candidate:", error);
    throw error;
  }
};

// Read a candidate by candidateId
const getCandidateByCandidateId = async (candidateId) => {
  try {
    const candidate = await Candidate.findOne({ candidateId: candidateId });
    if (!candidate) {
      console.log("Candidate not found");
      return null;
    }
    console.log("Candidate details:", candidate);
    return candidate;
  } catch (error) {
    console.error("Error retrieving candidate:", error);
    throw error;
  }
};

// Update a candidate by ID
const updateCandidate = async (candidateId, updatedData) => {
  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedData,
      { new: true }
    );
    if (!updatedCandidate) {
      console.log("Candidate not found for update");
      return null;
    }
    console.log("Candidate updated:", updatedCandidate);
    return updatedCandidate;
  } catch (error) {
    console.error("Error updating candidate:", error);
    throw error;
  }
};

// Delete a candidate by ID
const deleteCandidate = async (candidateId) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);
    if (!deletedCandidate) {
      console.log("Candidate not found for deletion");
      return null;
    }
    console.log("Candidate deleted:", deletedCandidate);
    return deletedCandidate;
  } catch (error) {
    console.error("Error deleting candidate:", error);
    throw error;
  }
};

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  getCandidateByCandidateId,
  updateCandidate,
  deleteCandidate,
};
