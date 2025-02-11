import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import MasoomContract from "../contracts/MasoomContract.json";
import getWeb3 from "../getWeb3";

import NavigationAdmin from "./NavigationAdmin";
import Navigation from "./Navigation";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]); // State to store transactions
  const [isOwner, setIsOwner] = useState(false);
  const [account, setAccount] = useState(null);
  const location = useLocation(); // Hook to detect URL changes

  async function getTransactions() {
    try {
      // Refreshing page only once
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }

      // Get network provider and web3 instance
      const web3Instance = await getWeb3();

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = MasoomContract.networks[networkId];
      const instance = new web3Instance.eth.Contract(
        MasoomContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      const latestBlockNumber = await web3Instance.eth.getBlockNumber();
      const txList = []; // Temporary array to store transactions

      for (let i = latestBlockNumber - 1; i <= latestBlockNumber; i++) {
        const block = await web3Instance.eth.getBlock(i, true); // Include transactions
        if (block && block.transactions) {
          block.transactions.forEach((tx) => {
            txList.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: web3Instance.utils.fromWei(tx.value, "ether"),
              gas: tx.gas,
            });
          });
        }
      }
      setTransactions(txList); // Update the state with all transactions

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
  }

  useEffect(() => {
    getTransactions();
  }, [location]);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center">
            {isOwner
              ? "Admin - Transaction Verification"
              : "Transaction History"}
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-auto">
        {isOwner ? <NavigationAdmin /> : <Navigation />}
      </div>

      {/* Transactions List */}
      <div className="mx-auto mt-8 px-4">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Transaction Details
          </h2>
          {transactions.length > 0 ? (
            <ul className=" divide-gray-200">
              <div className="flex flex-row gap-2 justify-between">
                {Object.keys(transactions[0]).map((key, index) => (
                  <li key={index} className="text-start py-1 w-1/5">
                    <p
                      key={index}
                      className="font-medium text-sm text-gray-900 truncate overflow-hidden px-2"
                    >
                      {key}
                    </p>
                  </li>
                ))}
              </div>
              {transactions.map((tx, index) => (
                <li
                  key={index}
                  className={"py-2" + (index % 2 === 0 ? " bg-gray-100" : "")}
                >
                  <div className="flex flex-row gap-2 justify-between">
                    <p className="text-xs font-medium text-gray-700 w-1/5 truncate overflow-hidden px-2">
                      {/* <span className="font-bold">Transaction Hash:</span>{" "} */}
                      {tx.hash}
                    </p>
                    <p className="text-xs font-medium text-gray-700 w-1/5 truncate overflow-hidden px-2">
                      {/* <span className="font-bold">From:</span> */}
                      {tx.from}
                    </p>
                    <p className="text-xs font-medium text-gray-700 w-1/5 truncate overflow-hidden px-2">
                      {/* <span className="font-bold">To:</span>{" "} */}
                      {tx.to || "Contract"}
                    </p>
                    <p className="text-xs font-medium text-gray-700 w-1/5 truncate overflow-hidden px-2">
                      {/* <span className="font-bold">Value:</span> */}
                      {tx.value} ETH
                    </p>
                    <p className="text-xs font-medium text-gray-700 w-1/5 truncate overflow-hidden px-2">
                      {/* <span className="font-bold">Gas Used:</span> */}
                      {tx.gas}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
