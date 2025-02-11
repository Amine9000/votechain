import React, { useState, useEffect } from "react";
import MasoomContract from "../contracts/MasoomContract.json";
import getWeb3 from "../getWeb3";
import axios from "axios";

import { FormGroup, FormControl, Button } from "react-bootstrap";

import NavigationAdmin from "./NavigationAdmin";
import Navigation from "./Navigation";

const AddCandidate = () => {
  const [MasoomInstance, setMasoomInstance] = useState(undefined);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [constituency, setConstituency] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  const updateName = (event) => setName(event.target.value);
  const updateParty = (event) => setParty(event.target.value);
  const updateManifesto = (event) => setManifesto(event.target.value);
  const updateConstituency = (event) => setConstituency(event.target.value);

  // name: { type: String, required: true },
  // party: { type: String, required: true },
  // manifesto: { type: String, required: true },
  // voteCount: { type: Number, default: 0 },
  // constituency: { type: Number, required: true },
  // candidateId: { type: Number, unique: true },

  const addCandidate = async () => {
    axios
      .post("http://localhost:5000/api/candidates", {
        name,
        party,
        manifesto,
        constituency,
      })
      .then(async (response) => {
        const candidateId = response.data.candidateId;
        const transactionReceipt = await MasoomInstance.methods
          .addCandidate(candidateId)
          .send({ from: account, gas: 1000000 });

        // Send transaction details to the backend for logging
        axios
          .post("http://localhost:5000/api/candidates/logTransaction", {
            candidateId,
            transactionHash: transactionReceipt.transactionHash,
            blockNumber: transactionReceipt.blockNumber,
            gasUsed: transactionReceipt.gasUsed,
          })
          .then(() => {
            window.location.reload(false);
          })
          .catch((error) => {
            console.error("There was an error submitting the data:", error);
          });
      })
      .catch((error) => {
        console.error("There was an error submitting the data:", error);
      });
  };

  useEffect(() => {
    const initialize = async () => {
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }

      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = MasoomContract.networks[networkId];
        const instance = new web3.eth.Contract(
          MasoomContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setMasoomInstance(instance);
        setWeb3(web3);
        setAccount(accounts[0]);

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

    initialize();
  }, []);

  if (!web3) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>Loading Web3, accounts, and contract..</h1>
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
    <div className="App">
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>Add Candidate</h1>
        </div>
      </div>
      {isOwner ? <NavigationAdmin /> : <Navigation />}

      <div className="form">
        <FormGroup>
          <div className="form-label">Enter Name - </div>
          <div className="form-input">
            <FormControl input="text" value={name} onChange={updateName} />
          </div>
        </FormGroup>

        <FormGroup>
          <div className="form-label">Enter Party Name - </div>
          <div className="form-input">
            <FormControl
              input="textArea"
              value={party}
              onChange={updateParty}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <div className="form-label">Enter Manifesto - </div>
          <div className="form-input">
            <FormControl
              input="text"
              value={manifesto}
              onChange={updateManifesto}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <div className="form-label">Enter Constituency Number - </div>
          <div className="form-input">
            <FormControl
              input="text"
              value={constituency}
              onChange={updateConstituency}
            />
          </div>
        </FormGroup>

        <Button onClick={addCandidate} className="button-vote">
          Add
        </Button>
      </div>
    </div>
  );
};

export default AddCandidate;
