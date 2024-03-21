const Request = require("../models/requestModel");
const User = require("../models/userModel");

async function createRequest(requestBody) {
  const requestDoc = new Request({
    requestUser: requestBody.requestUser,
    requestDate: new Date(),
    state: requestBody.state,
  });
  return await requestDoc.save();
}

async function acceptRequest(requestId) {
  let query = {
    $set: { state: true },
  };
  return await Request.findOneAndUpdate({ _id: requestId }, query, {
    new: true,
  });
}

async function changeTipeUser(userId) {
  let query = {
    $set: { tipo: 1 },
  };
  return await User.findOneAndUpdate({ _id: userId }, query, { new: true });
}

async function deletectRequest(requestId) {
  return await Request.deleteOne({ _id: requestId });
}

async function findAllRequests(paginate_options) {
  paginate_options.populate = [{path: 'requestUser'}];
  return await Request.paginate({}, paginate_options);
  //return await Request.find().populate("requestUser").exec();
}

async function findRequestsById(requestId) {
  return await Request.findById(requestId).populate("requestUser").exec();
}

async function findUser(user) {
  const result_user = await Request.findOne({ requestUser: user }).exec();

  let find_detail = {
    found: false,
  };

  if (result_user) {
    find_detail.found = true;
    find_detail.result_user = "Request pending";
  }
  return find_detail;
}

module.exports = {
  createRequest,
  findAllRequests,
  acceptRequest,
  deletectRequest,
  findRequestsById,
  changeTipeUser,
  findUser
};
