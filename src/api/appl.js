const Application = require("../model/application");
async function findA() {
  let result = await Application.find({
    advRefNo: "AIIMS/Rbl/Rec/Non-faculty/2023-24/293",
  });
    console.log(result);

  return result;
}

