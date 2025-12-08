import { txJsonToEncodedValues } from '../utils/txJsonToEncodedValues'

describe('txJsonToEncodedValues', () => {
  it('should return the encoded values', () => {
    const txJson = {
      TransactionType: 'Payment',
      Account: 'rrrrrrrrrrrrrrrrrrrrrhoLvTp',
      Destination: 'rrrrrrrrrrrrrrrrrrrrrhoLvTp',
      Amount: '0',
    }
    const encodedValues = txJsonToEncodedValues(txJson)
    expect(encodedValues).toStrictEqual({
      TransactionType: { name: 'TransactionType', type: 'UInt16', stringValue: 'Payment', byteLength: 3, offset: 0, encoded: { header: [0x12], length: [], value: [0, 0] } },
      Account: { name: 'Account', type: 'AccountID', stringValue: 'rrrrrrrrrrrrrrrrrrrrrhoLvTp', byteLength: 22, offset: 3, encoded: { header: [0x81], length: [0x14], value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] } },
      Amount: { name: 'Amount', type: 'Amount', stringValue: '0', byteLength: 9, offset: 47, encoded: { header: [0x61], length: [], value: [0x40, 0, 0, 0, 0, 0, 0, 0] } },
      Destination: { name: 'Destination', type: 'AccountID', stringValue: 'rrrrrrrrrrrrrrrrrrrrrhoLvTp', byteLength: 22, offset: 25, encoded: { header: [0x83], length: [0x14], value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] } },
    })
  })

  it('STObject', () => {
    const txJson = {
      AmountEntry: { Amount: '1' }
    }
    const encodedValues = txJsonToEncodedValues(txJson)
    expect(encodedValues).toStrictEqual({
      AmountEntry: {
        name: "AmountEntry", type: "STObject", byteLength: 2, offset: 0,
        encoded: {
          header: [0xE0, 0x5B],
          length: [],
          value: [],
          endMaker: [0xE1]
        },
        stringValue: { Amount: '1' },
        children: [
          {
            Amount: {
              name: "Amount",
              type: "Amount",
              byteLength: 9,
              stringValue: "1",
              offset: 0,
              encoded: {
                header: [0x61],
                length: [],
                value: [0x40, 0, 0, 0, 0, 0, 0, 1]
              }
            }
          }
        ]
      }
    })
  })

  it('STArray', () => {
    const txJson = {
      Amounts: [{ AmountEntry: { Amount: '1' } }, { AmountEntry: { Amount: '2' } }]
    }
    const encodedValues = txJsonToEncodedValues(txJson)
    expect(encodedValues).toStrictEqual({
      Amounts: {
        name: "Amounts",
        type: "STArray",
        stringValue: [{ AmountEntry: { Amount: '1' } }, { AmountEntry: { Amount: '2' } }],
        byteLength: 2,
        offset: 0,
        encoded: {
          header: [
            0xF0,
            0x5C
          ],
          length: [],
          value: [],
          endMaker: [
            0xF1
          ]
        },
        children: [
          {
            AmountEntry: {
              name: "AmountEntry",
              type: "STObject",
              stringValue: { Amount: '1' },
              byteLength: 2,
              offset: 0,
              encoded: {
                header: [0xE0, 0x5B],
                length: [],
                value: [],
                endMaker: [0xE1]
              },
              children: [
                {
                  Amount: {
                    name: "Amount",
                    type: "Amount",
                    stringValue: "1",
                    byteLength: 9,
                    offset: 0,
                    encoded: {
                      header: [0x61],
                      length: [],
                      value: [0x40, 0, 0, 0, 0, 0, 0, 1]
                    }
                  }
                }
              ]
            }
          },
          {
            AmountEntry: {
              name: "AmountEntry",
              type: "STObject",
              stringValue: { Amount: '2' },
              byteLength: 2,
              offset: 0,
              encoded: {
                header: [0xE0, 0x5B],
                length: [],
                value: [],
                endMaker: [0xE1]
              },
              children: [
                {
                  Amount: {
                    name: "Amount",
                    type: "Amount",
                    stringValue: "2",
                    byteLength: 9,
                    offset: 0,
                    encoded: {
                      header: [0x61],
                      length: [],
                      value: [0x40, 0, 0, 0, 0, 0, 0, 2]
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    })
  })

  it('VECTOR256', () => {
    const txJson = {
      URITokenIDs: ["0000000000000000000000000000000000000000000000000000000000000000", "0000000000000000000000000000000000000000000000000000000000000000"]
    }
    const encodedValues = txJsonToEncodedValues(txJson)
    expect(encodedValues).toStrictEqual({
      URITokenIDs: {
        name: "URITokenIDs",
        type: "Vector256",
        byteLength: 68,
        offset: 0,
        encoded: {
          header: [
            0x00,
            0x13,
            0x63
          ],
          length: [64],
          value: Array(64).fill(0),
        },
        stringValue: ["0000000000000000000000000000000000000000000000000000000000000000", "0000000000000000000000000000000000000000000000000000000000000000"],
      }
    })
  })
})
