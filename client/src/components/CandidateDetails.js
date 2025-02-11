import React, { useState, useEffect } from "react";
import MasoomContract from "../contracts/MasoomContract.json";
import getWeb3 from "../getWeb3";
import axios from "axios";

import "../index.css";

import NavigationAdmin from "./NavigationAdmin";
import Navigation from "./Navigation";

const CandidateDetails = () => {
  const [masoomInstance, setMasoomInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [candidateCount, setCandidateCount] = useState(0);
  const [candidateList, setCandidateList] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Refreshing page only once
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }

      try {
        // Get network provider and web3 instance
        const web3Instance = await getWeb3();

        // Use web3 to get the user's accounts
        const accounts = await web3Instance.eth.getAccounts();

        // Get the contract instance
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = MasoomContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          MasoomContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3Instance);
        setMasoomInstance(instance);
        setAccount(accounts[0]);

        // Fetch candidate count
        const count = await instance.methods.getCandidateNumber().call();
        setCandidateCount(count);

        // Fetch candidate details
        let candidates = [];
        const response = await axios.get(
          `http://localhost:5000/api/candidates`
        );
        candidates = response.data;
        console.log(candidates);
        // for (let i = 1; i <= count; i++) {
        //   const candidate = await instance.methods.candidateDetails(i).call();
        //   const response = await axios.get(
        //     `http://localhost:5000/api/candidates/${i}`
        //   );
        //   candidates.push(response.data);
        // }
        setCandidateList(candidates);

        // Check if the current user is the contract owner
        const owner = await instance.methods.getOwner().call();
        if (accounts[0] === owner) {
          setIsOwner(true);
        }
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };

    init();
  }, []);

  const renderCandidates = () => {
    return candidateList.map((candidate) => (
      <div className="candidate" key={candidate.candidateId}>
        <div className="candidateName">{candidate.name}</div>
        <div className="candidateDetails">
          <div>Party: {candidate.party}</div>
          <div>Manifesto: {candidate.manifesto}</div>
          <div>Constituency Number: {candidate.constituency}</div>
          <div>Candidate ID: {candidate.candidateId}</div>
        </div>
      </div>
    ));
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

  return (
    <div className="CandidateDetails">
      <div className="CandidateDetails-title">
        <h1>Candidates List</h1>
      </div>
      {isOwner ? <NavigationAdmin /> : <Navigation />}
      <div className="CandidateDetails-sub-title">
        Total Number of Candidates - {candidateCount}
      </div>
      <div>{renderCandidates()}</div>
    </div>
  );
};

export default CandidateDetails;
