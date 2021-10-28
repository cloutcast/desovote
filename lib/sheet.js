const {
  GoogleSpreadsheet
} = require("google-spreadsheet");

async function getBallot() {
  try {
    let doc = new GoogleSpreadsheet('19dvOsDTqkc-Ct7an25XcxHRhqxuCF_G8FRLiiSgzNYk');
    await doc.useServiceAccountAuth(require('./../gCred.json'));

    await doc.loadInfo();


    let sheet = doc.sheetsByTitle['Ballot'];
    let rows = await sheet.getRows();

    let tOut = [];

    for (var row of rows) {
      tOut.push({
        b: row.BallotID,
        u: row.Username, 
        d: row.Description,
        z: null
      });
    }

    let randomArray = [...new Array(tOut.length)]
    .map(() => Math.round(Math.random() * tOut.length));

    for (var i in tOut) {
      tOut[i].z = randomArray[0];
      randomArray.shift();
    }

    return tOut;

  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

async function addEntry(publicKey, id1, id2, id3) {
  try {
    let didVote = await votedAlready(publicKey);

    if (didVote == true) {
      throw new Error("publicKey already casted a ballot.");
    }

    let doc = new GoogleSpreadsheet('19dvOsDTqkc-Ct7an25XcxHRhqxuCF_G8FRLiiSgzNYk');
    await doc.useServiceAccountAuth(require('./../gCred.json'));

    await doc.loadInfo();


    let sheet = doc.sheetsByTitle['Votes'];

    await sheet.addRow([publicKey, id1, id2, id3, new Date().toISOString() ]);

    return true;
  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

async function votedAlready(publicKey) {
  try {
    let doc = new GoogleSpreadsheet('19dvOsDTqkc-Ct7an25XcxHRhqxuCF_G8FRLiiSgzNYk');
    await doc.useServiceAccountAuth(require('./../gCred.json'));

    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['Votes'];
    let rows = await sheet.getRows();

    let isFound = false;
    for (var row of rows) {
      let vPub = row.PublicKey;
      if (publicKey == vPub) {
        isFound = true;
      }
    }

    return isFound;

  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}


module.exports = {
  addEntry, getBallot, votedAlready
};