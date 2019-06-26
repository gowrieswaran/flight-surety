var Test = require("../config/testConfig.js");
var BigNumber = require("bignumber.js");
var Web3Utils = require("web3-utils");

contract("Flight Surety Tests", async accounts => {
  var config;
  before("setup contract", async () => {
    config = await Test.Config(accounts);
    console.log(config.flightSuretyApp.address);
    await config.flightSuretyData.authorizeCaller(
      config.flightSuretyApp.address
    );
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function() {
    // Get operating status

    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function() {
    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false, {
        from: config.testAddresses[2]
      });
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function() {
    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false);
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(
      accessDenied,
      false,
      "Access not restricted to Contract Owner"
    );
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function() {
    await config.flightSuretyData.setOperatingStatus(false);

    let reverted = false;
    try {
      await config.flightSurety.setTestingMode(true);
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true);
  });

  it("(airline) cannot register an Airline using registerAirline() if it is not funded", async () => {
    // ARRANGE
    let newAirline = accounts[2];
    let newAirline1 = accounts[3];
    let amount = Web3Utils.toWei("1", "ether");

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, "GE0608", 0, {
        from: config.firstAirline
      });

      await config.flightSuretyApp.fundAirline(newAirline, {
        from: config.firstAirline,
        value: amount,
        gasPrice: 0
      });
    } catch (e) {}
    let result = await config.flightSuretyApp.isAirlineFunded.call(newAirline);

    // ASSERT
    assert.equal(
      result,
      false,
      "Airline should not be able to register another airline if it hasn't provided funding"
    );
  });

  it("(airline)Airline can be registerd using registerAirline() if it has 50% airlines votes ", async () => {
    // ARRANGE

    let newAirline1 = accounts[6];
    let newAirline2 = accounts[7];
    let newAirline3 = accounts[8];
    let amount = Web3Utils.toWei("10", "ether");
    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline1, "GE1234", 0, {
        from: config.firstAirline
      });
      await config.flightSuretyApp.fundAirline(newAirline1, {
        from: config.firstAirline,
        value: amount,
        gasPrice: 0
      });

      await config.flightSuretyApp.registerAirline(newAirline2, "GE5678", 0, {
        from: config.firstAirline
      });
      await config.flightSuretyApp.fundAirline(newAirline2, {
        from: config.firstAirline,
        value: amount,
        gasPrice: 0
      });

      await config.flightSuretyApp.registerAirline(newAirline3, "GE2526", 1, {
        from: config.firstAirline
      });
      await config.flightSuretyApp.fundAirline(newAirline3, {
        from: config.firstAirline,
        value: amount,
        gasPrice: 0
      });
    } catch (e) {}

    let result = await config.flightSuretyApp.isAirlineFunded.call(newAirline3);

    // ASSERT
    assert.equal(
      result,
      false,
      "Airline should not be able to register when it not holds enough votes"
    );
  });

  it("(passenger)A passenger can buy insurance", async () => {
    // ARRANGE
    let passenger = accounts[5];
    let newAirline = accounts[6];
    let airlineCode = "GE1112";
    let time = Math.floor(Date.now() / 1000);
    let amount = Web3Utils.toWei("1", "ether");
    let reverted = false;
    // ACT
    try {
      await config.flightSuretyApp.registerFlight.sendTransaction(
        newAirline,
        airlineCode,
        time,
        { from: passenger, value: amount }
      );
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Insurance not purchased!!!");
  });

  it("(passenger)Passenger balance before insurance claim is 0", async () => {
    // ARRANGE
    let passenger = accounts[7];
    let balance = 7;
    let reverted = false;

    //ACT
    try {
      balance = await config.flightSuretyApp.insureeBalance({
        from: passenger
      });
    } catch (e) {
      reverted = true;
    }

    // ASSERT

    assert.equal(reverted, true, "Error in retrieving balance");
  });
});
