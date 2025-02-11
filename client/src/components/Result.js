import React, { useState, useEffect } from "react";
import MasoomContract from "../contracts/MasoomContract.json";
import getWeb3 from "../getWeb3";
import axios from "axios";

import NavigationAdmin from "./NavigationAdmin";
import Navigation from "./Navigation";

import { FormGroup, FormControl, Button } from "react-bootstrap";

const Result = () => {
  const [masoomInstance, setMasoomInstance] = useState(undefined);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [toggle, setToggle] = useState(false);
  const [result, setResult] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [candidateList, setCandidateList] = useState(null);
  const [start, setStart] = useState(false);
  const [end, setEnd] = useState(false);
  const [constituency, setConstituency] = useState("");

  const updateConstituency = (event) => {
    setConstituency(event.target.value);
  };

  const fetchResult = async () => {
    let results = [];
    let max = 0;
    let candidates = [];

    // const candidateCount = await masoomInstance.methods
    //   .getCandidateNumber()
    //   .call();
    const candidateRes = await axios.get(
      `http://localhost:5000/api/candidates`
    );
    for (let candidate of candidateRes.data) {
      if (Number(constituency) === candidate.constituency) {
        const candidateDetails = await masoomInstance.methods
          .candidateDetails(candidate.candidateId)
          .call();
        candidate = { ...candidate, candidateDetails };
        candidates.push(candidate);
        if (candidate.candidateDetails.voteCount === max) {
          results.push(candidate);
        } else if (candidate.candidateDetails.voteCount > max) {
          results = [candidate];
          max = candidate.voteCount;
        }
      }
    }
    console.log(results);
    setResult(results);
    setToggle(true);
    setCandidateList(candidates);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = MasoomContract.networks[networkId];
        const instance = new web3.eth.Contract(
          MasoomContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3);
        setAccount(accounts[0]);
        setMasoomInstance(instance);

        const owner = await instance.methods.getOwner().call();
        setIsOwner(accounts[0] === owner);

        const start = await instance.methods.getStart().call();
        const end = await instance.methods.getEnd().call();

        setStart(start);
        setEnd(end);
      } catch (error) {
        alert(
          "Failed to load web3, accounts, or contract. Check console for details."
        );
        console.error(error);
      }
    };

    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    } else {
      init();
    }
  }, []);

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

  if (!end) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>END THE VOTING....TO SEE RESULTS</h1>
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  const renderCandidateList = (list) => {
    return (list || []).map((candidate) => (
      <div className="candidate" key={candidate.candidateId}>
        <div className="candidateName">
          {candidate.name} : {candidate.candidateDetails.voteCount} Votes
        </div>
        <div className="candidateDetails">
          <div>Party : {candidate.party}</div>
          <div>Manifesto : {candidate.manifesto}</div>
          <div>Constituency Number : {candidate.constituency}</div>
          <div>Candidate ID : {candidate.candidateId}</div>
        </div>
      </div>
    ));
  };

  return (
    <div className="App">
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>RESULTS</h1>
        </div>
      </div>
      {isOwner ? <NavigationAdmin /> : <Navigation />}

      <div className="form">
        <FormGroup>
          <div className="form-label">
            Enter Constituency Number for results -{" "}
          </div>
          <div className="form-input">
            <FormControl
              type="text"
              value={constituency}
              onChange={updateConstituency}
            />
          </div>
          <Button onClick={fetchResult} className="button-vote">
            Result
          </Button>
        </FormGroup>
      </div>

      <br />

      {toggle && (
        <div>
          <div className="CandidateDetails-mid-sub-title">Leaders -</div>
          {renderCandidateList(result)}
          <div className="CandidateDetails-mid-sub-title">
            Constituency Votes -
          </div>
          {renderCandidateList(candidateList)}
        </div>
      )}
    </div>
  );
};

export default Result;
