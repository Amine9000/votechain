import React, { useState, useEffect } from "react";
import MasoomContract from "../contracts/MasoomContract.json";
import getWeb3 from "../getWeb3";
import axios from "axios";

import { Button } from "react-bootstrap";

import NavigationAdmin from "./NavigationAdmin";
import Navigation from "./Navigation";

import "../index.css";

const VerifyVoter = () => {
  const [masoomInstance, setMasoomInstance] = useState(undefined);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [votersList, setVotersList] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }

      try {
        const web3Instance = await getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = MasoomContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          MasoomContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setMasoomInstance(instance);

        console.log(instance);

        let voters = [];

        // Fetch all voters from your API
        const response = await axios.get("http://localhost:5000/api/voters");
        voters = response.data; // Assuming this returns an array of voter records

        // Iterate through the voter list to fetch voterAddress and details from the blockchain
        for (const voter of voters) {
          const voterId = voter.voterId; // Adjust 'voterId' if the key is named differently
          try {
            const voterDetails = await instance.methods
              .getVoterById(voterId)
              .call();
            voter.voterDetails = voterDetails;
          } catch (error) {
            voters = voters.filter((v) => v.voterId !== voterId);
            console.log(`Error fetching voter with ID ${voterId}:`, error);
            continue;
          }
        }

        setVotersList(voters);

        const owner = await instance.methods.getOwner().call();
        setIsOwner(accounts[0] === owner);
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };

    init();
  }, []);

  const verifyVoter = async (voterId) => {
    try {
      await masoomInstance.methods
        .verifyVoter(voterId)
        .send({ from: account, gas: 1000000 });
      window.location.reload(false);
    } catch (error) {
      console.error("Error verifying voter:", error);
    }
  };

  if (!web3) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>Loading Web3, accounts, and contract...</h1>
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>ONLY ADMIN CAN ACCESS</h1>
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  return (
    <div>
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>Verify Voters</h1>
        </div>
      </div>
      {isOwner ? <NavigationAdmin /> : <Navigation />}
      <div>
        {votersList &&
          votersList.map((voter, index) => (
            <div key={index} className="candidate">
              <div className="candidateName">{voter.name}</div>
              <div className="candidateDetails">
                <div>Aadhar: {voter.aadhar}</div>
                <div>Constituency: {voter.constituency}</div>
                <div>Voter Address: {voter.voterDetails.voterAddress}</div>
              </div>
              {voter.voterDetails.isVerified ? (
                <Button className="button-verified">Verified</Button>
              ) : (
                <Button
                  onClick={() => {
                    verifyVoter(voter.voterId);
                  }}
                  value={voter.voterId}
                  className="button-verify"
                >
                  Verify
                </Button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default VerifyVoter;
