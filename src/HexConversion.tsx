import React, { useState } from "react";
import JsonTextArea from "./utils/JsonTextArea";
import HookTextArea from "./utils/HookTextArea";
import { encode } from "xahau";
import { DEFAULT_DEFINITIONS } from "xahau-binary-codec";

function formatHexString(hexString: string): string {
  // Pad the string with leading zeros if it's not an even length
  if (hexString.length % 2 !== 0) {
      hexString = '0' + hexString;
  }

  // Split the string into pairs of two characters
  const pairs = hexString.match(/.{1,2}/g);

  // Format each pair as "0xXXU"
  const formattedPairs = pairs?.map(pair => `0x${pair.toUpperCase()}U`);

  // Join the formatted pairs with a comma and a space
  return formattedPairs?.join(', ') + ',';
}

function formatAbbrv(value: string, type: string): string {
  switch (type) {
    case 'TransactionType':
      return `tt = ${value}`
    default:
      return type.toLowerCase()
  }
}

function formatEmptyType(field: string, type: string, encoded: string): string {
  switch (type) {
    case 'AccountID':
      return `${formatHexString(encoded.slice(0, 4))} 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    case 'Amount':
      switch (field) {
        case 'Fee':
          return `${formatHexString(encoded.slice(0, 4))} 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U,`
        default:
          if (encoded.length <= 10 * 2 /* 10 bytes or less (header 1 or 2bytes + 8 bytes) */) {
            // return formatHexString(encoded)
            return `${formatHexString(encoded.slice(0, 4))} 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U, 0x00U,`
          } else {
            return formatHexString(encoded)
            // return `${formatHexString(encoded.slice(0, 2))} 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U, 0x99U,`
          }
      }
    case 'Blob':
      return `${formatHexString(encoded.slice(0, 4))} 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    case 'Hash256':
      return `${formatHexString(encoded.slice(0, 4))} 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    case 'SigningPubKey':
      return `0x73U, 0x21U, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,`
    default:
      switch (field) {
        // case 'DestinationTag':
        //   return `0x99U, 0x99U, 0x99U, 0x99U, 0x99U,`
        default:
          return formatHexString(encoded)
      }
  }
}

function formatField(value: string, field: string, type: string, byteLength: string, offset: string, encoded: string): string {
  let abbrv = formatAbbrv(value, field)
  abbrv += " ".padEnd(24 - (abbrv.length))
  return `/*  ${byteLength.toString().padStart(3,' ')},  ${offset.toString().padStart(3,' ')}, ${abbrv} */   ${formatEmptyType(field, type, encoded)}\n`
}

function addDefaultFields(jsonData: any): any {
  // Define default values for the fields
  const defaults = {
    Flags: 0,
    Sequence: 0,
    FirstLedgerSequence: 0,
    LastLedgerSequence: 0,
    Fee: '0',
    SigningPubKey: '000000000000000000000000000000000000000000000000000000000000000000',
    Account: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
  };
  if (jsonData.Destination) {
    // @ts-ignore
    defaults['DestinationTag'] = 0
  }

  // Create a new object to hold the sorted fields
  const sortedJsonData: any = {};

  // Add fields from approveList in order, using values from jsonData or defaults
  approveList.forEach((field) => {
    if (jsonData.hasOwnProperty(field)) {
      sortedJsonData[field] = jsonData[field];
    } else if (defaults.hasOwnProperty(field)) {
      // @ts-ignore
      sortedJsonData[field] = defaults[field];
    }
  });

  // Add any additional fields from jsonData that are not in approveList
  Object.keys(jsonData).forEach((key) => {
    if (!sortedJsonData.hasOwnProperty(key)) {
      sortedJsonData[key] = jsonData[key];
    }
  });

  return sortedJsonData;
}

function abbreviateCamelCase(variableName: string, limit: number = 4): string {
  // If the variable name is less than 6 characters, uppercase the whole word and append "_OUT"
  if (variableName.length <= 7) {
    return variableName.toUpperCase() + "_OUT";
  }

  switch (variableName) {
    case 'TransactionType':
      return "TT_OUT";
    case 'Destination':
      return "DEST_OUT";
    case 'DestinationTag':
      return "DTAG_OUT";
    case 'SourceTag':
      return "STAG_OUT";
    case 'FirstLedgerSequence':
      return "FLS_OUT";
    case 'LastLedgerSequence':
      return "LLS_OUT";
    case 'CheckID':
      return "ID_OUT";
    case 'Expiration':
      return "EXP_OUT";
    case 'InvoiceID':
      return "INV_ID_OUT";
    case 'EscrowID':
      return "ID_OUT";
    case 'DeliverMin':
      return "DMIN_OUT";
    case 'Authorize':
      return "AUTH_OUT";
    case 'Unauthorize':
      return "UNAUTH_OUT";
    case 'OfferSequence':
      return "OFF_SEQ_OUT";
    case 'CancelAfter':
      return "CAN_AFT_OUT";
    case 'FinishAfter':
      return "FIN_AFT_OUT";
    case 'Condition':
      return "COND_OUT";
    case 'Fulfillment':
      return "FULFILL_OUT";
    case 'TakerGets':
      return "T_GETS_OUT";
    case 'TakerPays':
      return "T_PAYS_OUT";
    case 'Signature':
      return "SIG_OUT";
    case 'PublicKey':
      return "PK_OUT";
    case 'SettleDelay':
      return "SETDLAY_OUT";
    case 'RegularKey':
      return "RKEY_OUT";
    case 'SignerQuorum':
      return "QUORUM_OUT";
    case 'SignerEntries':
      return "ENTRIES_OUT";
    case 'TicketCount':
      return "TCOUNT_OUT";
    case 'LimitAmount':
      return "LAMT_OUT";
    case 'QualityIn':
      return "QIN_OUT";
    case 'QualityOut':
      return "QOUT_OUT";
    case 'URITokenID':
      return "ID_OUT";
    case 'EmitDetails':
      return "EMIT_OUT";
    default:
      return variableName.toUpperCase() + "_OUT";
  }
}

const nonApproveList = [
  'TransactionType',
  'Sequence',
  'SigningPubKey',
]
const approveList = [
  'TransactionType',
  'Flags',
  'Sequence',
  'DestinationTag',
  'SourceTag',
  'FirstLedgerSequence',
  'LastLedgerSequence',
  // Hash256
  'CheckID', // CheckCancel
  'InvoiceID', // CheckCreate
  'Channel', // PaymentChannelClaim
  'URITokenID', // URITokenBurn
  'OfferSequence', // EscrowCancel
  'Expiration', // CheckCreate
  'CancelAfter', // EscrowCreate
  'FinishAfter', // EscrowCreate
  'Condition', // EscrowCreate
  'Fulfillment', // EscrowFinish
  'Signature', // PaymentChannelClaim
  'PublicKey', // PaymentChannelClaim
  'SettleDelay', // PaymentChannelCreate
  'Hooks', // SetHook
  'SignerQuorum', // SignerListSet
  'SignerEntries', // SignerListSet
  'TicketCount', // TicketCreate
  'QualityIn', // TrustSet
  'QualityOut', // TrustSet
  // Amount
  'Amount',
  'LimitAmount', // TrustSet
  'DeliverMin', // CheckCash
  'SendMax', // CheckCreate
  'TakerGets', // OfferCreate
  'TakerPays', // OfferCreate
  'Balance', // PaymentChannelClaim
  'Fee',
  'SigningPubKey',
  // AccountID
  'Account',
  'Destination',
  'Issuer', // ClaimReward
  'Authorize', // DepositPreauth
  'Unauthorize', // DepositPreauth
  'Owner', // EscrowCancel
  'RegularKey', // SetRegularKey
  // VL
  'URI', // URITokenMint
  'Digest', // URITokenMint
  'Blob', // Import
  'Paths', // Payment
  'EmitDetails',
]
function addToMacroDict(field: string, type: string, header_length: number, offset: number) {  
  if (!nonApproveList.includes(field)) {
    return {
      name: abbreviateCamelCase(field),
      offset: offset + additionalOffset(field, type, header_length),
      arg: `${camelToSnake(field)}`
    }
  }
}

function additionalOffset(field: string, type: string, header_length: number) {
  switch (type) {
    case 'AccountID':
      return header_length + 1 /* + length(0x14) */; 
    case 'STArray':
      if (field === 'EmitDetails')
        return 0;
      return header_length; // TODO: check if this is correct
    default:
      return header_length;
  }
}

const autofilltList = [
  'Account',
  'Fee',
  'EmitDetails',
  'FirstLedgerSequence',
  'LastLedgerSequence',
  'Flags',
]

function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, (match) => `${match.toLowerCase()}`);
}

function getAdditionalArgs(field:string, flags: number): any {
  switch (field) {
    case 'Account':
      return ['account_buffer']
    case 'LimitAmount':
      return ['currency_buffer', 'issuer_buffer', 'amount_xfl']
    case 'TakerGets':
      if (flags === 1) {
        return ['xah_xfl']
      }
      return ['currency_buffer', 'issuer_buffer', 'amount_xfl']
    case 'TakerPays':
      if (flags === 0) {
        return ['xah_xfl']
      }
      return ['currency_buffer', 'issuer_buffer', 'amount_xfl']
    default:
      return null;
  }
}

console.log(getAdditionalArgs('TakerPays', 0));

const HexConversion: React.FC = () => {
  const [hexOutput, setHexOutput] = useState<string>("");
  let IOUFields: string[] = [];
  const handleOnConvert = (json: any, hasCallback: boolean) => {
    const jsonData = addDefaultFields(JSON.parse(json))
    let macroDict: Record<string, { name: string; offset: number; arg: string }> = {}
    let byteTotal = 0
    let offset = 0
    const tarray: string[] = []
    Object.keys(jsonData).forEach((key) => {
      // Perform any additional processing with the key and value here
      const _json = {} as any
      _json[key] = jsonData[key]
      const encoded = encode(_json)

      // @ts-ignore
      const field = DEFAULT_DEFINITIONS.field[key as string].name
      // @ts-ignore
      const type = DEFAULT_DEFINITIONS.field[key as string].type.name
      
      const header_length = DEFAULT_DEFINITIONS.field.fromString(key).header.length

      const byteLength = encoded.length / 2

      // @ts-ignore
      tarray.push(formatField(jsonData[key], field, type, byteLength, offset, encoded))
      
      const result = addToMacroDict(field, type,  header_length, offset)
      if (result) {
        macroDict[field] = result
      }

      if (type === 'Amount' && encoded.length > 10 * 2)
        IOUFields.push(field);

      byteTotal += byteLength
      offset += byteLength
    });

    const emitTotal = hasCallback ? 138: 116

    byteTotal += emitTotal
    
    enum TEXT_INDEX {
      TXN = 0,
      TX_BUILDER = 1,
      MACROS = 2,
      SET_FIELDS = 3,
      EMIT = 4,
      PREPARE_TXN = 5,
      SAMPLES = 6,
    }
    
    let texts: string[] = Array(7).fill('')
    texts[TEXT_INDEX.TXN] += "// clang-format off\n"
    texts[TEXT_INDEX.TXN] += `uint8_t txn[${byteTotal}] =\n`
    texts[TEXT_INDEX.TXN] += "{\n"
    texts[TEXT_INDEX.TXN] += "/* size, upto, field name               */\n"
    for (let i = 0; i < tarray.length; i++) {
      const t = tarray[i];
      texts[TEXT_INDEX.TXN] += t
    }
    const result = addToMacroDict('EmitDetails', 'STArray', 0, offset)
    macroDict['EmitDetails'] = result
    texts[TEXT_INDEX.TXN] += `/*  ${emitTotal},  ${offset.toString().padStart(3,' ')}, emit details             */ \n`
    offset += emitTotal
    texts[TEXT_INDEX.TXN] += `/*    0,  ${offset.toString().padStart(3,' ')},                          */ \n`
    texts[TEXT_INDEX.TXN] += "};\n"
    texts[TEXT_INDEX.TXN] += "// clang-format on\n\n"

    texts[TEXT_INDEX.TX_BUILDER] += "// TX BUILDER\n"

    console.log(macroDict);
    
    Object.keys(macroDict).forEach((key) => {
      const value = macroDict[key]
      texts[TEXT_INDEX.TX_BUILDER] += `#define ${value.name} (txn + ${value.offset}U)\n`
    })

    const args: Record<string, { name: string; offset: number; arg: string }> = {}
    Object.keys(macroDict).forEach((key) => {
      if (!autofilltList.includes(key)) {
        args[key] = macroDict[key]
      }
    })

    // console.log(args);


    texts[TEXT_INDEX.PREPARE_TXN] += `
#define PREPARE_TXN()                                                          \\
  do {                                                                         \\
    etxn_reserve(1);                                                           \\
    uint32_t fls = (uint32_t)ledger_seq() + 1;                                 \\
    SET_UINT32(FLS_OUT, fls);                                                  \\
    SET_UINT32(LLS_OUT, fls + 4);                                              \\
    hook_account(ACCOUNT_OUT, 20);                                             \\
    etxn_details(EMIT_OUT, ${emitTotal}U);                                              \\
    int64_t fee = etxn_fee_base(SBUF(txn));                                    \\
    SET_NATIVE_AMOUNT(FEE_OUT, fee);                                           \\
    TRACEHEX(txn);                                                             \\
  } while (0)
`

    texts[TEXT_INDEX.SAMPLES] += "\n/* \n"
    const filterArgsByFieldType = (type: string) => Object.keys(args).filter((name) => DEFAULT_DEFINITIONS.field.fromString(name).type.name === type)
    const uint16Fields = filterArgsByFieldType("UInt16")
    if (uint16Fields.length > 0) {
      texts[TEXT_INDEX.MACROS] += `
#define FLIP_ENDIAN_16(value)                                                  \\
  (uint16_t)(((value & 0xFFU) << 8) | ((value & 0xFF00U) >> 8))
`
      texts[TEXT_INDEX.SET_FIELDS] += `
#define SET_UINT16(ptr, value) *((uint16_t *)(ptr)) = FLIP_ENDIAN_16(value);
`
      for (const field of uint16Fields) {
        texts[TEXT_INDEX.SAMPLES] += `SET_UINT16(${abbreviateCamelCase(field)}, 0); \n`
      }
    }
    const uint32Fields = filterArgsByFieldType("UInt32")
    if (uint32Fields.length > 0 || true /* force as FLS and LLS */) {
      texts[TEXT_INDEX.MACROS] += `
#define FLIP_ENDIAN_32(value)                                                  \\
  (uint32_t)(((value & 0xFFU) << 24) | ((value & 0xFF00U) << 8) |              \\
             ((value & 0xFF0000U) >> 8) | ((value & 0xFF000000U) >> 24))
`
      texts[TEXT_INDEX.SET_FIELDS] += `
#define SET_UINT32(ptr, value) *((uint32_t *)(ptr)) = FLIP_ENDIAN_32(value);
`
      for (const field of uint32Fields) {
        texts[TEXT_INDEX.SAMPLES] += `SET_UINT32(${abbreviateCamelCase(field)}, 0);\n`
      }
    }
    const uint64Fields = filterArgsByFieldType("UInt64") // not transaction fields
    if (uint64Fields.length > 0) {
      texts[TEXT_INDEX.MACROS] += `
#define FLIP_ENDIAN_64(value)                                                  \\
  (uint64_t)(((value & 0xFFU) << 56) | ((value & 0xFF00U) << 48) |             \\
             ((value & 0xFF0000U) << 40) | ((value & 0xFF000000U) << 32) |     \\
             ((value & 0xFF00000000U) << 24) |                                 \\
             ((value & 0xFF0000000000U) << 16) |                               \\
             ((value & 0xFF000000000000U) << 8) |                              \\
             ((value & 0xFF00000000000000U) >> 0))
`
      texts[TEXT_INDEX.SET_FIELDS] += "#define SET_UINT64(ptr, value) * ((uint64_t *)(ptr)) = FLIP_ENDIAN_64(value); \n"
      for (const field of uint64Fields) {
        texts[TEXT_INDEX.SAMPLES] += `SET_UINT64(${abbreviateCamelCase(field)}, 0);\n`
      }
    }
    // const hash128Fields = filterArgsByFieldType("Hash128")
    const hash256Fields = filterArgsByFieldType("Hash256")
    if (hash256Fields.length > 0) {
      texts[TEXT_INDEX.SET_FIELDS] += `
#define SET_HASH256(ptr_to, ptr_from)                                          \\
  {                                                                            \\
    const unsigned char *buf_from = (const unsigned char *)ptr_from;           \\
    unsigned char *buf_to = (unsigned char *)ptr_to;                           \\
    *(uint64_t *)(buf_to + 0) = *(const uint64_t *)(buf_from + 0);             \\
    *(uint64_t *)(buf_to + 8) = *(const uint64_t *)(buf_from + 8);             \\
    *(uint64_t *)(buf_to + 16) = *(const uint64_t *)(buf_from + 16);           \\
    *(uint64_t *)(buf_to + 24) = *(const uint64_t *)(buf_from + 24);           \\
  }
`
      for (const field of hash256Fields) {
        texts[TEXT_INDEX.SAMPLES] += `uint8_t hash[32]; \n`
        texts[TEXT_INDEX.SAMPLES] += `SET_HASH256(${abbreviateCamelCase(field)}, hash);\n`
      }
    }
    const amountFields = filterArgsByFieldType("Amount")
    if (amountFields.length > 0 || true /* force as Fee */) {
    texts[TEXT_INDEX.SET_FIELDS] += `
#define SET_NATIVE_AMOUNT(ptr, amount)                                         \\
  do {                                                                         \\
    uint8_t *b = (ptr);                                                        \\
    *b++ = 0b01000000 + ((amount >> 56) & 0b00111111);                         \\
    *b++ = (amount >> 48) & 0xFFU;                                             \\
    *b++ = (amount >> 40) & 0xFFU;                                             \\
    *b++ = (amount >> 32) & 0xFFU;                                             \\
    *b++ = (amount >> 24) & 0xFFU;                                             \\
    *b++ = (amount >> 16) & 0xFFU;                                             \\
    *b++ = (amount >> 8) & 0xFFU;                                              \\
    *b++ = (amount >> 0) & 0xFFU;                                              \\
  } while (0)
`
      if (IOUFields.length > 0)
       texts[TEXT_INDEX.SET_FIELDS] += `
#define SET_IOU_AMOUNT(ptr, issuer, currency, amount_xfl)                      \\
  do {                                                                         \\
    uint8_t *b = (ptr);                                                        \\
    *b++ = 0b11000000 + ((amount_xfl >> 56) & 0b00111111);                     \\
    *b++ = (amount_xfl >> 48) & 0xFFU;                                         \\
    *b++ = (amount_xfl >> 40) & 0xFFU;                                         \\
    *b++ = (amount_xfl >> 32) & 0xFFU;                                         \\
    *b++ = (amount_xfl >> 24) & 0xFFU;                                         \\
    *b++ = (amount_xfl >> 16) & 0xFFU;                                         \\
    *b++ = (amount_xfl >> 8) & 0xFFU;                                          \\
    *b++ = (amount_xfl >> 0) & 0xFFU;                                          \\
    *(uint64_t *)(b + 0) = *(uint64_t *)(currency + 0);                        \\
    *(uint64_t *)(b + 8) = *(uint64_t *)(currency + 8);                        \\
    *(uint32_t *)(b + 16) = *(uint32_t *)(currency + 16);                      \\
    *(uint64_t *)(b + 24) = *(uint64_t *)(issuer + 0);                         \\
    *(uint64_t *)(b + 32) = *(uint64_t *)(issuer + 8);                         \\
    *(uint32_t *)(b + 40) = *(uint32_t *)(issuer + 16);                        \\
  } while (0)
`
      for (const field of amountFields) {
        if (!IOUFields.includes(field))
          texts[TEXT_INDEX.SAMPLES] += `SET_NATIVE_AMOUNT(${abbreviateCamelCase(field)}, 100);\n`
        else
          texts[TEXT_INDEX.SAMPLES] += `SET_IOU_AMOUNT(${abbreviateCamelCase(field)}, issuer_buffer, currency_buffer, amount_xfl);\n`
      }
    }
    // const blobFields = filterArgsByFieldType("Blob")
    const accountFields = filterArgsByFieldType("AccountID")
    if (accountFields.length > 0) {
      texts[TEXT_INDEX.SET_FIELDS] += `
#define SET_ACCOUNT(ptr_to, ptr_from)                                          \\
  {                                                                            \\
    unsigned char *buf_to = (unsigned char *)ptr_to;                           \\
    unsigned char *buf_from = (unsigned char *)ptr_from;                       \\
    *(uint64_t *)(buf_to + 0) = *(uint64_t *)(buf_from + 0);                   \\
    *(uint64_t *)(buf_to + 8) = *(uint64_t *)(buf_from + 8);                   \\
    *(uint32_t *)(buf_to + 16) = *(uint32_t *)(buf_from + 16);                 \\
  }
`
      texts[TEXT_INDEX.SAMPLES] += "uint8_t account_buffer[20]; \n"
      for (const field of accountFields) {
        texts[TEXT_INDEX.SAMPLES] += `SET_ACCOUNT(${abbreviateCamelCase(field)}, account_buffer);\n`
      }
    }
    // const objectFields = filterArgsByFieldType("STObject")
    // const arrayFields = filterArgsByFieldType("STArray")
    const uint8Fields = filterArgsByFieldType("UInt8")
    if (uint8Fields.length > 0) {
      texts[TEXT_INDEX.SET_FIELDS] += "#define SET_UINT8(ptr, value) *((uint8_t *)(ptr)) = (value); \n"
      for (const field of uint8Fields) {
        texts[TEXT_INDEX.SAMPLES] += `SET_UINT8(${abbreviateCamelCase(field)}, 0);\n`
      }
    }
    // const hash160fields = filterArgsByFieldType("Hash160") // no transaction fields
    // const pathSetFields = filterArgsByFieldType("PathSet")
    // const vector256fields = filterArgsByFieldType("Vector256") // URITokenIDs
    
    texts[TEXT_INDEX.SAMPLES] += "PREPARE_TXN(); \n"

    texts[TEXT_INDEX.SAMPLES] += "uint8_t emithash[32]; \n"
    texts[TEXT_INDEX.SAMPLES] += "int64_t emit_result = emit(SBUF(emithash), SBUF(txn)); \n"
    texts[TEXT_INDEX.SAMPLES] += "*/ \n"

    setHexOutput(texts.join(''))
  };

  return (
    <div>
      <h1>Xahau Hook Tx Builder</h1>
      <p>Paste a json Xahau tx below to convert it to a c hook binary tx.</p>
      <JsonTextArea onConvert={handleOnConvert} />
      <HookTextArea value={hexOutput} />
    </div>
  );
};

export default HexConversion;
