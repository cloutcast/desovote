// import b58 from 'bs58check';
// import jsonwebtoken from 'jsonwebtoken';
// import {ec} from 'elliptic';
// import KeyEncoder from 'key-encoder';
// import axios from 'axios';
// let ic = new ec("secp256k1");


const b58 = require("bs58check");
const jsonwebtoken = require("jsonwebtoken");
const {ec} = require('elliptic');
const KeyEncoder = require("key-encoder").default;

const axios = require("axios");

const ic = new ec('secp256k1');


function validateJwt(bitCloutPublicKey, jwtToken) {
  const bitCloutPublicKeyDecoded = b58.decode(bitCloutPublicKey);

  // manipulate the decoded key to remove the prefix that gets added
  // see: privateKeyToBitcloutPublicKey - https://github.com/bitclout/identity/blob/main/src/app/crypto.service.ts#L128

  // turn buffer into an array to easily manipulate
  const bitCloutPublicKeyDecodedArray = [...bitCloutPublicKeyDecoded];
  // Remove the public key prefix to get the 'raw public key'
  // not sure if hardcoding this to 3 elements is safe
  // see: PUBLIC_KEY_PREFIXES - https://github.com/bitclout/identity/blob/main/src/app/crypto.service.ts#L22
  const rawPublicKeyArray = bitCloutPublicKeyDecodedArray.slice(3);

  const rawPublicKeyHex = ic
    .keyFromPublic(rawPublicKeyArray, "hex")
    .getPublic()
    .encode("hex", true);

  const keyEncoder = new KeyEncoder("secp256k1");
  const rawPublicKeyEncoded = keyEncoder.encodePublic(
    rawPublicKeyHex,
    "raw",
    "pem"
  );

  // if the jwt or public key is invalid this will throw an error
  const result = jsonwebtoken.verify(jwtToken, rawPublicKeyEncoded, {
    algorithms: ["ES256"],
    
  });
  return result;

}

exports.validateJwt = validateJwt;