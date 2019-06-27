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
      let flight = DOM.elid("airline-number").value;
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

    DOM.elid("buy-insurance").addEventListener("click", () => {
      let flightChoosen = DOM.elid("airline-number").value;
      let insuredAmt = DOM.elid("insurance-value").value;
      DOM.elid("insurance-for-flight").value = insuredAmt;
      DOM.elid("selected-flight").value = flightChoosen;
      contract.purchaseFlightInsurance(
        flightChoosen,
        insuredAmt,
        (error, result) => {
          display("Flight", "Purchase Flight Insurace", [
            {
              label: "Purchase Flight Insurance Status ",
              error: error,
              value: true
            }
          ]);
        }
      );
    });

    DOM.elid("show-credits").addEventListener("click", () => {
      // Write transaction
      contract.getCredits((error, result) => {
        display("Available Credits", "Available Credits", [
          { label: "Available Credits ", error: error, value: result }
        ]);
      });
    });

    DOM.elid("withdraw-credits").addEventListener("click", () => {
      // Write transaction

      let amount = DOM.elid("amountToWithdraw").value;
      contract.withdrawCredits(amount, (error, result) => {
        display("Flight", "Widthdraw Credits", [
          { label: "Withdraw Credit ", error: error, value: true }
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
