var express = require('express');
var router = express.Router();

let sheets = require("./../lib/sheet");


/* GET home page. */
router.post('/vote', async function(req, res, next) {
  try {

    console.dir(req.body);
    let publicKey = req.headers['x-deso-publickey'] || null;

    if (publicKey == null) {
      throw new Error("somehow public key is null.");
    }

    let [id1, id2 = 0, id3 = 0] = req.body;
    await sheets.addEntry(publicKey, id1, id2, id3);
    return res.json({
      success: true
    });
  } catch (ex) {
    return next(ex);
  }
});
router.get('/get', async function(req, res, next) {
  try {
    let shetz = await sheets.getBallot();
    // console.log(shetz);
    res.json({
      data: shetz,
      success: true,
      
    });
  } catch (ex) {
    return next(ex);
  }
})
module.exports = router;
