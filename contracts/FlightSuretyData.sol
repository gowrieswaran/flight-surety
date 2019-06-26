pragma solidity ^0.4.24;        

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /* DATA VARIABLES */

    address private contractOwner;
    bool private operational = true;
    
    uint256 airlinesCount;
    uint256 flightsCount;
    /* Struct Definitions */

    struct Airline {
        bool isRegistered;
        bool isFunded;
        string airlineCode;
    }

    
    struct FlightInsurance {
        address insuree;
        bytes32 flightKey;
        uint256 insuranceAmount;
    }

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 depTimeStamp;
        address airline;
        string flightCode;
    }
    /* Mapping */

    mapping(address => bool) authorizedCaller;
    mapping(address => Airline) private airlines;
    mapping(bytes32 => Flight) private flights;
   
    mapping(bytes32 => uint256) private passengerFlightCredits;
    mapping(address => uint256) private passengerCredits;
    mapping(bytes32 => uint256) private flightInsurance;

    /*  EVENT DEFINITIONS    */


    event AirlineRegistered (address airlineAddress, bool isRegistered, bool isFunded, string airlineCode );

    event FlightRegistered (address airline, string flightCode, uint256 timestamp );


    /**
    * @dev Constructor
    *         The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirline
                                ) 
                                public 
    {
        contractOwner = msg.sender;

        airlines[firstAirline] = Airline({isRegistered: true, isFunded: true, airlineCode: " "});

        airlinesCount =1;
        flightsCount = 0;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireIsCallerAuthorized() {
        require(authorizedCaller[msg.sender] == true, "Caller not Authorized");
        _;
    }

    modifier verifyOtherAirlinesApproval (uint256 validVotesCount) {
        require(airlinesCount < 4 || SafeMath.div(SafeMath.mul(validVotesCount, 100), airlinesCount) >= 50, "Minimum 50% airlines should vote to register new airline");    
        _;
    }
    
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            external 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function authorizeCaller
                            (
                                address contractAddress
                            ) 
                            external
                            requireContractOwner 
    {
        authorizedCaller[contractAddress] = true;
    }


    function checkCallerAuthorized() external view returns (bool){
        if(authorizedCaller[msg.sender] == true)
        return true;
        else 
        return false;
    }
    
    function isAirlineFunded
                            (
                                address airline
                            ) 
                            public
                            view 
                            requireIsCallerAuthorized
                            returns (bool)
    {
        return airlines[airline].isFunded;
    }

    function isFlightRegistered(address airline, string flight , uint256 timestamp) requireIsCallerAuthorized external view returns(bool){

        bytes32  flightKey = getFlightKey( airline, flight, timestamp );
        return flights[flightKey].isRegistered;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                address airlineAddress,
                                string airlineCode,
                                uint256 validVotesCount
                            )
                            external
                            requireIsOperational
                            requireIsCallerAuthorized
                            verifyOtherAirlinesApproval(validVotesCount)
                            returns (bool)
    {
       airlines[airlineAddress] = Airline({
                                        isRegistered: true,
                                        isFunded: false,
                                        airlineCode: airlineCode
                                    });
        airlinesCount = airlinesCount +1;
        
        emit AirlineRegistered (airlineAddress,airlines[airlineAddress].isRegistered, airlines[airlineAddress].isFunded, airlines[airlineAddress].airlineCode );

        return airlines[airlineAddress].isRegistered;
    }

    function fundAirline
                        (
                            address airline
                        )
                        external
                        payable
                        requireIsOperational
                        requireIsCallerAuthorized
                        returns (bool)
    {
         if(airlines[airline].isRegistered){
            airlines[airline].isFunded = true;
        }
         return true;

    }

     function registerFlight( address airline, string  flight, uint256 timestamp, uint8 statusCode) requireIsCallerAuthorized external                                
    {
        bytes32  flightKey = getFlightKey( airline, flight, timestamp );

        flights[flightKey] = Flight({
                                        isRegistered: true,
                                        statusCode: statusCode,
                                        depTimeStamp: timestamp,       
                                        airline: airline,
                                        flightCode: flight
                                    });   
        flightsCount = flightsCount +1;

        emit FlightRegistered (flights[flightKey].airline, flights[flightKey].flightCode, flights[flightKey].depTimeStamp );
    }

    function getAirlineCount() requireIsCallerAuthorized external view returns (uint256){
        return airlinesCount;
    }

    function checkAirlinesApproval(uint256 validVotesCount ) requireIsCallerAuthorized external view returns (bool) {       

        bool flag = airlinesCount < 4 || SafeMath.div(SafeMath.mul(validVotesCount, 100), airlinesCount) >= 50 ; 
        return flag;
    }
     /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (  
                                address insuree,
                                address airline,
                                string flight, 
                                uint256 timeStamp
                            )
                            external
                            payable
                            requireIsCallerAuthorized                           
    {
        require(msg.value <= 1 ether, "Passenger can insure upto one ETH");
        bytes32 key = keccak256(abi.encodePacked(insuree, airline, flight, timeStamp));
        flightInsurance[key] = msg.value;

    }

    function processFlightStatus( address airline, string  flight, uint256 timestamp, uint8 statusCode ) requireIsCallerAuthorized external
    {
        bytes32  flightKey = getFlightKey( airline, flight, timestamp );
       
        flights[flightKey].statusCode = statusCode;
    }

    function getPassengerInsuredAmount(address insuree , address airline, string  flight, uint256 timestamp) requireIsCallerAuthorized view external  returns(uint256)
    {
        bytes32  passengerflightKey =  keccak256(abi.encodePacked(insuree, airline, flight, timestamp));
        uint256 amount = flightInsurance[passengerflightKey] ;
        return amount;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    address insuree,
                                    address airline,
                                    string flight,
                                    uint256 timestamp
                                )
                                requireIsCallerAuthorized
                                external
    {
        bytes32  passengerflightKey =  keccak256(abi.encodePacked(insuree, airline, flight, timestamp));
        uint256 amountToCredit = flightInsurance[passengerflightKey];
        amountToCredit= amountToCredit.mul(15).div(10);
        if(flightInsurance[passengerflightKey] > 0){
            
            passengerFlightCredits[passengerflightKey] = amountToCredit;
            passengerCredits[insuree]= amountToCredit;
        }

    }
    
    function getCredits(address insuree) requireIsCallerAuthorized external view returns(uint256) {
        uint256 credits = passengerCredits[insuree];
        return credits; 
    }
    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address insuree,
                                uint256 insuranceAmount
                            )
                            requireIsCallerAuthorized
                            external
                            payable
    {
         uint256 creditBefore =  passengerCredits[insuree] ;

      require(creditBefore >= insuranceAmount ,"No sufficient funds for caller!!");

     passengerCredits[insuree] = creditBefore.sub(insuranceAmount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   

                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        requireIsCallerAuthorized
                        view
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

