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
      TransactionType: { name: 'TransactionType', type: 'UInt16', byteLength: 3, offset: 0, encoded: { header: [0x12], length: [], value: [0, 0] } },
      Account: { name: 'Account', type: 'AccountID', byteLength: 22, offset: 3, encoded: { header: [0x81], length: [0x14], value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] } },
      Amount: { name: 'Amount', type: 'Amount', byteLength: 9, offset: 47, encoded: { header: [0x61], length: [], value: [0x40, 0, 0, 0, 0, 0, 0, 0] } },
      Destination: { name: 'Destination', type: 'AccountID', byteLength: 22, offset: 25, encoded: { header: [0x83], length: [0x14], value: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] } },
    })
  })

  it('STObject', () => {
    const txJson = {
      AmountEntry: { Amount: '1' }
    }
    const encodedValues = txJsonToEncodedValues(txJson)
    expect(encodedValues).toStrictEqual({
      AmountEntry: {
        name: "AmountEntry", type: "STObject", byteLength: 12, offset: 0,
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
    })
  })
  
    it('STArray', () => {
    const txJson = {
      Amounts: [{ AmountEntry: { Amount: '1' } }, { AmountEntry: { Amount: '2' } }]
    }
    const encodedValues = txJsonToEncodedValues(txJson)
    expect(encodedValues).toStrictEqual({
      Amounts: {
        "name": "Amounts",
        type: "STArray",
        byteLength: 27,
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
              byteLength: 12,
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
              byteLength: 12,
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
})
