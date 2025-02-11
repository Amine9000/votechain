import React, { useState, useEffect } from "react";
import MasoomContract from "../contracts/MasoomContract.json";
import getWeb3 from "../getWeb3";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import NavigationAdmin from "./NavigationAdmin";
import Navigation from "./Navigation";
import axios from "axios";

const Vote = () => {
  const [MasoomInstance, setMasoomInstance] = useState();
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [candidateList, setCandidateList] = useState();
  const [candidateId, setCandidateId] = useState("");
  const [toggle, setToggle] = useState(false);
  const [myAccount, setMyAccount] = useState();
  const [candidateConstituencyList, setCandidateConstituencyList] = useState();
  const [start, setStart] = useState(false);
  const [end, setEnd] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const updateCandidateId = (event) => setCandidateId(event.target.value);

  const vote = async () => {
    if (!MasoomInstance || !myAccount || !account) return;

    let candidate = await MasoomInstance.methods
      .candidateDetails(candidateId)
      .call();

    if (myAccount.constituency !== candidate.constituency) {
      setToggle(true);
    } else {
      await MasoomInstance.methods
        .vote(candidateId)
        .send({ from: account, gas: 1000000 });
      setToggle(false);
      window.location.reload(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }

      try {
        const web3Instance = await getWeb3();
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = MasoomContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          MasoomContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setMasoomInstance(instance);
        const accountDataFromBC = await instance.methods
          .voterDetails(accounts[0])
          .call();

        const voterExists = await axios.get(
          `http://localhost:5000/api/voters/exists/${accountDataFromBC.voterId}`
        );
        if (!voterExists.data.exists) window.location = "/RequestVoter";
        const response = await axios.get(
          `http://localhost:5000/api/voters/${accountDataFromBC.voterId}`
        );
        const myAccountDetails = await instance.methods
          .voterIdMapping(response.data.voterId)
          .call();
        setMyAccount(myAccountDetails);

        const candidateCount = await instance.methods
          .getCandidateNumber()
          .call();

        const voterAccount = await axios.get(
          `http://localhost:5000/api/voters/${myAccountDetails.voterId}`
        );
        const candidates = await axios.get(
          `http://localhost:5000/api/candidates`
        );
        const list = [];
        for (let candidate of candidates.data) {
          if (voterAccount.data.constituency === candidate.constituency) {
            list.push(candidate);
          }
        }
        setCandidateConstituencyList(list);

        const startStatus = await instance.methods.getStart().call();
        const endStatus = await instance.methods.getEnd().call();
        setStart(startStatus);
        setEnd(endStatus);

        const owner = await instance.methods.getOwner().call();
        setIsOwner(accounts[0] === owner);
      } catch (error) {
        alert(
          "Failed to load web3, accounts, or contract. Check console for details."
        );
        console.error(error);
      }
    };

    init();
  }, []);

  let renderedCandidateList;
  if (candidateConstituencyList) {
    renderedCandidateList = candidateConstituencyList.map((candidate) => (
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
  }

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

  if (end) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>VOTING HAS ENDED</h1>
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  if (!start) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>VOTING HAS NOT STARTED YET.</h1>
        </div>
        <div className="CandidateDetails-sub-title">
          Please Wait... While election starts!
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  if (myAccount && !myAccount.isVerified) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>You need to be verified first for voting.</h1>
        </div>
        <div className="CandidateDetails-sub-title">
          Please wait... verification can take time.
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  if (myAccount && myAccount.hasVoted) {
    return (
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>YOU HAVE SUCCESSFULLY CASTED YOUR VOTE</h1>
        </div>
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="CandidateDetails">
        <div className="CandidateDetails-title">
          <h1>VOTE</h1>
        </div>
      </div>
      {isOwner ? <NavigationAdmin /> : <Navigation />}

      <div className="form">
        <FormGroup>
          <div className="form-label">Enter Candidate ID you want to vote:</div>
          <div className="form-input">
            <FormControl value={candidateId} onChange={updateCandidateId} />
          </div>
          <Button onClick={vote} className="button-vote">
            Vote
          </Button>
        </FormGroup>
      </div>

      {toggle && <div>You can only vote for your own constituency</div>}

      <div className="CandidateDetails-mid-sub-title">
        Candidates from your Constituency
      </div>

      <div>{renderedCandidateList}</div>
    </div>
  );
};

export default Vote;
