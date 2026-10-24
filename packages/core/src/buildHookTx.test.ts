import { describe, it, expect } from "vitest";
import { buildHookTx } from "./buildHookTx";

const zeros = "0".repeat(64);

describe("buildHookTx", () => {
  it("TrustSet", () => {
    expect(
      buildHookTx({
        TransactionType: "TrustSet",
        Account: "rPMh7Pi9ct699iZUTWaytJUoHcJ7cgyziK",
        Flags: 262144,
        LimitAmount: {
          currency: "BZO",
          issuer: "rHyB8fpHCTB4NhwayEtNH9DsjLue33n1ph",
          value: "100000000000",
        },
      }),
    ).toMatchSnapshot();
  });

  it("OfferCreate", () => {
    expect(
      buildHookTx({
        TransactionType: "OfferCreate",
        Account: "rPMh7Pi9ct699iZUTWaytJUoHcJ7cgyziK",
        Flags: 0,
        TakerGets: "6000000",
        TakerPays: {
          currency: "USD",
          issuer: "rExKpRKXNz25UAjbckCRtQsJFcSfjL9Er3",
          value: "2",
        },
      }),
    ).toMatchSnapshot();
  });

  it("Payment with callback", () => {
    expect(
      buildHookTx(
        {
          TransactionType: "Payment",
          Account: "rrrrrrrrrrrrrrrrrrrrrhoLvTp",
          Destination: "rrrrrrrrrrrrrrrrrrrrrhoLvTp",
          Amount: "0",
        },
        { hasCallback: true },
      ),
    ).toMatchSnapshot();
  });

  it("Vector256", () => {
    expect(
      buildHookTx({
        TransactionType: "Remit",
        Destination: "rrrrrrrrrrrrrrrrrrrrrhoLvTp",
        URITokenIDs: [zeros, zeros],
      }),
    ).toMatchSnapshot();
  });
});
