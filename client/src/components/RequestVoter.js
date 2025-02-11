import React, { useState, useEffect } from "react";
import MasoomContract from "../contracts/MasoomContract.json";
import getWeb3 from "../getWeb3";
import axios from "axios";

import NavigationAdmin from "./NavigationAdmin";
import Navigation from "./Navigation";

import { FormGroup, FormControl, Button } from "react-bootstrap";

const RequestVoter = () => {
  const [masoomInstance, setMasoomInstance] = useState(undefined);
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [name, setName] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [constituency, setConstituency] = useState("");
  const [registered, setRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const updateName = (event) => setName(event.target.value);
  const updateAadhar = (event) => setAadhar(event.target.value);
  const updateConstituency = (event) => setConstituency(event.target.value);

  const addVoter = async () => {
    axios
      .post("http://localhost:5000/api/voters", {
        name,
        aadhar,
        constituency,
      })
      .then(async (response) => {
        console.log("Data submitted successfully:", response.data);
        const voterId = response.data.voterId;
        const transactionReceipt = await masoomInstance.methods
          .requestVoter(voterId)
          .send({ from: account, gas: 1000000 });

        // Send transaction details to the backend for logging
        axios
          .post("http://localhost:5000/api/voters/logTransaction", {
            voterId,
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

        const voterCount = await instance.methods.getVoterCount().call();

        let registered = false;
        for (let i = 0; i < voterCount; i++) {
          const voterAddress = await instance.methods.voters(i).call();
          if (voterAddress === accounts[0]) {
            registered = true;
            break;
          }
        }

        setRegistered(registered);

        const owner = await instance.methods.getOwner().call();
        setIsOwner(accounts[0] === owner);
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
      initialize();
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

  if (registered) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>ALREADY REQUESTED TO REGISTER</h1>
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>VOTER FORM</h1>
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
          <div className="form-label">Enter Aadhar Number - </div>
          <div className="form-input">
            <FormControl
              input="textArea"
              value={aadhar}
              onChange={updateAadhar}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <div className="form-label">Enter Constituency - </div>
          <div className="form-input">
            <FormControl
              input="text"
              value={constituency}
              onChange={updateConstituency}
            />
          </div>
        </FormGroup>

        <Button onClick={addVoter} className="button-vote">
          Request to Add Voter
        </Button>
      </div>
    </div>
  );
};

export default RequestVoter;
