import FlightSuretyApp from "../../build/contracts/FlightSuretyApp.json";
import FlightSuretyData from "../../build/contracts/FlightSuretyData.json";
import Config from "./config.json";
import Web3 from "web3";

export default class Contract {
  constructor(network, callback) {
    let config = Config[network];
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
    this.flightSuretyData = new this.web3.eth.Contract(
      FlightSuretyData.abi,
      config.dataAddress
    );
    this.flightSuretyApp = new this.web3.eth.Contract(
      FlightSuretyApp.abi,
      config.appAddress
    );
    this.initialize(callback);
    this.owner = null;
    this.x = config.appAddress;
    this.airlines = [];
    this.passengers = [];
    this.firstAirline = null;
  }

  initialize(callback) {
    this.web3.eth.getAccounts(async (error, accts) => {
      console.log(accts);
      this.owner = accts[0];
      this.firstAirline = accts[1];
      let counter = 2;

      await this.flightSuretyData.methods.authorizeCaller(this.x).send({
        from: this.owner
      });

      while (this.airlines.length < 5) {
        this.airlines.push(accts[counter++]);
      }

      while (this.passengers.length < 5) {
        this.passengers.push(accts[counter++]);
      }

      callback();
    });
  }

  isOperational(callback) {
    let self = this;
    self.flightSuretyApp.methods
      .isOperational()
      .call({ from: self.owner }, callback);
  }
  oracleReport(callback) {
    let self = this;
    self.flightSuretyApp.events.OracleReport({}, function(error, event) {
      if (error) {
        console.log(error);
      } else {
        callback(event.returnValues);
      }
    });
  }

  flightStatusInfo(callback) {
    let self = this;
    self.flightSuretyApp.events.FlightStatusInfo({}, function(error, event) {
      if (error) {
        console.log(error);
      } else {
        callback(event.returnValues);
      }
    });
  }

  checkIfCallerAuthorized(callback) {
    let self = this;
    console.log("Caller here " + self.owner);
    self.flightSuretyApp.methods
      .checkIfCallerAuthorized()
      .call({ from: self.owner }, callback);
  }

  registerFlight(flight, value, callback) {
    let self = this;
    let flightCode = flight;
    let flightDepTime = Math.floor(Date.now() / 1000);

    self.flightSuretyApp.methods
      .registerFlight(self.airlines[0], flightCode, flightDepTime, 10)
      .send(
        {
          from: self.passengers[0],
          value: self.web3.utils.toWei(value, "ether"),
          gas: 1000000
        },
        (error, result) => {
          if (error) {
            console.log("Error in Register Flight", error);
          } else {
            console.log("Registered Successfully", result);
            callback(result);
          }
        }
      );
  }

  purchaseFlightInsurance(flight, amt, callback) {
    let self = this;
    let airlineAddress;
    let amount = web3.toWei(amt.toString(), "ether");
    if (flight == "ge0910") {
      airlineAddress = self.airlines[0];
    } else {
      airlineAddress = self.airlines[1];
    }
    let payload = {
      insuree: self.passengers[0],
      airline: airlineAddress,
      flight: flight,
      timestamp: 1538521800
    };
    self.flightSuretyApp.methods
      .buy(payload.insuree, payload.airline, payload.flight, payload.timestamp)
      .send(
        {
          from: self.owner,
          value: amount,
          gas: 4712388,
          gasPrice: 100000000000
        },
        (error, result) => {
          if (error) {
            console.log("Error in buying insurance", console.error);
          } else {
            console.log("Purchased insurance successfully", result);
            callback(result);
          }
        }
      );
  }
  getCredits(callback) {
    let self = this;
    let payload = {
      insuree: self.passengers[0]
    };

    self.flightSuretyApp.methods
      .getCredits(payload.insuree)
      .call({ from: self.owner }, callback);
  }

  withdrawCredits(amount, callback) {
    let self = this;
    amount = web3.toWei(amount.toString(), "ether");
    let payload = {
      insuree: self.passengers[0]
    };
    self.flightSuretyApp.methods.pay(payload.insuree).send(
      {
        from: self.owner,
        value: amount,
        gas: 4712388,
        gasPrice: 100000000000
      },
      (error, result) => {
        callback(error, payload);
      }
    );
  }

  fetchFlightStatus(flight, callback) {
    let self = this;
    let payload = {
      airline: self.airlines[0],
      flight: flight,
      timestamp: Math.floor(Date.now() / 1000)
    };
    self.flightSuretyApp.methods
      .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
      .send({ from: self.owner }, (error, result) => {
        callback(error, payload);
      });
  }

  checkInsuredAmount(flight, callback) {
    let self = this;
    let airlineAddress;
    let amount = 1;
    amount = web3.toWei(amount.toString(), "ether");
    if (flight == "ge0910") {
      airlineAddress = self.airlines[0];
    } else {
      airlineAddress = self.airlines[1];
    }
    let payload = {
      insuree: self.passengers[0],
      airline: airlineAddress,
      flight: flight,
      timestamp: 1549432800
    };

    self.flightSuretyApp.methods
      .getPassengerInsuredAmount(
        payload.insuree,
        payload.airline,
        payload.flight,
        payload.timestamp
      )
      .call({ from: self.owner }, callback);
  }
  s;
}
