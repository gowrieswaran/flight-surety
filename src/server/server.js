import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import Web3 from "web3";
import express from "express";

let config = Config["localhost"];
let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.url.replace("http", "ws"))
);
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(
  FlightSuretyApp.abi,
  config.appAddress
);
const promisify = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        console.log("Error  " + err);
        reject(err);
      } else {
        console.log("success");
        console.log(res);
        resolve(res);
      }
    })
  );
const onload = inner =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        console.log("Error in loading accounts  " + err);
        reject(err);
      } else {
        console.log("success");
        console.log(res);
        resolve(res);
      }
    })
  );

var accounts = promisify(cb => web3.eth.getAccounts(cb));

function getAccounts() {
  return new Promise((resolve, reject) => {
    web3.eth
      .getAccounts()
      .then(accounts => {
        web3.eth.defaultAccount = accounts[0];
        console.log("Account loaded successfully!!!!");
        resolve(accounts);
      })
      .catch(err => {
        reject(err);
      });
  });
}
flightSuretyApp.events.OracleRequest(
  {
    fromBlock: 0
  },
  function(error, event) {
    if (error) console.log(error);
    console.log(event);
  }
);

const app = express();
app.get("/api", (req, res) => {
  res.send({
    message: "An API for use with your Dapp!"
  });
});

export default app;
