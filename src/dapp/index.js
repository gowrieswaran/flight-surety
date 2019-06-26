import DOM from "./dom";
import Contract from "./contract";
import "./flightsurety.css";

(async () => {
  let result = null;

  let contract = new Contract("localhost", () => {
    console.log("Contract", contract);
    // Read transaction
    contract.isOperational((error, result) => {
      display("Operational Status", "Check if contract is operational", [
        { label: "Operational Status", error: error, value: result }
      ]);
    });

    // User-submitted transaction
    DOM.elid("submit-oracle").addEventListener("click", () => {
      let flight = DOM.elid("flight-number").value;
      // Write transaction
      contract.fetchFlightStatus(flight, (error, result) => {
        display("Oracles", "Trigger oracles", [
          {
            label: "Fetch Flight Status",
            error: error,
            value: result.flight + " " + result.timestamp
          }
        ]);
      });
    });

    // // register airline
    // DOM.elid("submit-airline").addEventListener("click", () => {
    //   let airlineCode = DOM.elid("airline-number").value;
    //   // Write transaction
    //   contract.registerAirline(airlineCode, (error, result) => {
    //     console.log(result);
    //     display("Airline", "Register Airline", [
    //       {
    //         label: "Register Airline Status ",
    //         error: error,
    //         value: result.airlineCode + " " + result.airline
    //       }
    //     ]);
    //   });
    // });

    // buy airline insurance
    DOM.elid("buy0910").addEventListener("click", () => {
      let amt = DOM.elid("flightETH0910").value;
      let flight = "GE0910";
      contract.purchaseFlightInsurance(flight, amt, (error, result) => {
        display("Insurance Purchased for", "Flight " + flight, [
          { label: "TXN - ", error: error, value: result }
        ]);
      });
    });

    DOM.elid("buy1601").addEventListener("click", () => {
      let amt = DOM.elid("flightETH1601").value;
      let flight = "GE1601";
      contract.purchaseFlightInsurance(flight, amt, (error, result) => {
        display("Insurance Purchased for", "Flight " + flight, [
          { label: "TXN - ", error: error, value: result }
        ]);
      });
    });

    DOM.elid("buy0608").addEventListener("click", () => {
      let amt = DOM.elid("flightETH0608").value;
      let flight = "GE0608";
      contract.purchaseFlightInsurance(flight, amt, (error, result) => {
        display("Insurance Purchased for", "Flight " + flight, [
          { label: "TXN - ", error: error, value: result }
        ]);
      });
    });
  });
})();

function display(title, description, results) {
  let displayDiv = DOM.elid("display-wrapper");
  let section = DOM.section();
  section.appendChild(DOM.h3(title));
  section.appendChild(DOM.h5(description));
  results.map(result => {
    let row = section.appendChild(DOM.div({ className: "row" }));
    row.appendChild(DOM.div({ className: "col-sm-4 field" }, result.label));
    row.appendChild(
      DOM.div(
        { className: "col-sm-8 field-value" },
        result.error ? String(result.error) : String(result.value)
      )
    );
    section.appendChild(row);
  });
  displayDiv.append(section);
}
