const express = require("express");
const router = express.Router();
const requestServise = require("../services/requestService");
const { tokenAuthentication, checkTipo } = require("../middleware/jwt-auth");

//post request by user
router.post(
  "/post",
  tokenAuthentication,
  checkTipo([2]),
  async (req, res, next) => {
    //console.log("esto es",req.tokenData.userid);
    const request = {
      requestUser: req.tokenData.userid,
      state: false,
    };

    const find_user = await requestServise.findUser(request.requestUser);

    if (find_user.found) {
      return res.status(422).json(find_user);
    }

    requestServise.createRequest(request).then((data) => {
      console.log(data);
      if (data) {
        return res.status(201).json({
          message: "New request created",
        });
      } else {
        return res.status(422).json({
          message: "Could not create the request",
        });
      }
    });
  }
);
//accept
router.put(
  "/accept/:requestid",
  tokenAuthentication,
  checkTipo([0]),
  async (req, res, next) => {
    const requestId = req.params.requestid;

    requestServise
      .findRequestsById(requestId)
      .then((data0) => {
        if (data0) {
          //return res.status(200).json(data.requestUser);
          requestServise
            .acceptRequest(requestId)
            .then((data) => {
              if (!data) {
                return res.status(400).json({
                  message: "Error accepting the request",
                });
              } else {
                requestServise.changeTipeUser(data0.requestUser._id);
                return res.status(200).json({
                  message: "Request accepted",
                  request: data,
                });
              }
            })
            .catch((error) => {
              console.log(error);
              return res.status(400).json({
                message: "Failed request",
                error: error,
              });
            });
        } else {
          return res.status(404).json({
            message: "That request does not exist",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({
          message: "Could not get that request",
          error: error,
        });
      });
  }
);
//delete request
router.delete(
  "/delete/:requestid",
  tokenAuthentication,
  checkTipo([0]),
  (req, res, next) => {
    const requestId = req.params.requestid;

    requestServise
      .deletectRequest(requestId)
      .then((data) => {
        if (data) {
          return res.status(200).json({
            message: "Request deleted",
          });
        } else {
          res.status(400).json({
            message: "Could not delete the request",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({
          message: "Could not delete the request",
          error: error.message,
        });
      });
  }
);

//get all requests
router.get("/get", tokenAuthentication, checkTipo([0]), (req, res, next) => {
  //res.send("testing category");
  // requestServise.findAllRequests().then((data) => {
  //   return res.status(200).json(data);
  // });

  const paginate_options = {
    limit: parseInt(req.query.limit) || 10,
    page: parseInt(req.query.page) || 1,
  };

  requestServise
    .findAllRequests(paginate_options)
    .then((documents) => {
      return res.status(200).json(documents);
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        message: "Could not get requests",
        error: error,
      });
    });
});

//get request by id
router.get(
  "/get/:requestid",
  tokenAuthentication,
  checkTipo([0]),
  (req, res, next) => {
    const requestId = req.params.requestid;

    requestServise
      .findRequestsById(requestId)
      .then((data) => {
        if (data) {
          return res.status(200).json(data);
        } else {
          return res.status(404).json({
            message: "That request does not exist",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({
          message: "Could not get that request",
          error: error,
        });
      });
  }
);

module.exports = router;
