import { encode, DEFAULT_DEFINITIONS } from "xahau-binary-codec"

export type EncodedValue = {
    name: string
    type: string
    byteLength: number
    offset: number
    stringValue: string
    encoded: {
      header: number[]
      length: number[]
      value: number[]
      endMaker?: number[]
    }
    children?: EncodedValues[]
}

export type EncodedValues = {
  [key: string]: EncodedValue
}

const hexToNumberArray = (hex: string) => {
  return hex.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || []
}

const getVarLengthLength = (bytes: number[]) => {
  if (bytes[0] < 193)
    return 1
  if (bytes[0] < 240)
    return 2
  return 3
}

const txJsonToEncodedValues = (txJson: Record<string, any>) => {
  const encodedValues = {} as EncodedValues
  let offset = 0
  Object.keys(txJson).forEach((key) => {
    const field = DEFAULT_DEFINITIONS.field.fromString(key)
    const headerLength = field.header.length
    const encoded = hexToNumberArray(encode({ [key]: txJson[key] }))

    const header = encoded.slice(0, headerLength)
    const length = field.isVariableLengthEncoded ? encoded.slice(headerLength, headerLength + getVarLengthLength(encoded.slice(headerLength))) : []
    const value = ['STObject', 'STArray'].includes(field.type.name) ? [] : encoded.slice(header.length + length.length)
    
    const byteLength = header.length + length.length + value.length

    const endMaker = field.type.name === 'STObject' ? [0xE1] : field.type.name === 'STArray' ? [0xF1] : []
    
    const children = field.type.name === 'STObject' ? [txJsonToEncodedValues(txJson[key])] :  field.type.name === 'STArray' ? (txJson[key] as any[]).map(item => txJsonToEncodedValues(item)) : []
    
    encodedValues[key] = {
      name: key,
      type: field.type.name,
      byteLength: byteLength,
      offset: offset,
      stringValue: txJson[key],
      encoded: {
        header: header,
        length: length,
        value: value,
        ...(endMaker.length > 0 ? { endMaker } : {}),
      },
      ...(children.length > 0 ? { children } : {}),
    }
    offset += encoded.length
  })
  return encodedValues
}

export { txJsonToEncodedValues }
