// const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const categoriesService = require("../services/categoriesService");
// const userservice = require("../services/userService");
const { tokenAuthentication, checkTipo } = require('../middleware/jwt-auth');

router.get("/get", (req, res, next) => {
  //res.send("testing category");
  categoriesService.findAllCategories().then((data) => {
    return res.status(200).json(data);
  });
});

/*router.get("/getUser", (req, res, next) => {
  //res.send("testing category");
  userservice.findAllUsers().then((data) => {
    return res.status(200).json(data);
  });
});*/

router.get("/getid/:categoryid", (req, res, next) => {
  const categoryid = req.params.categoryid;
  categoriesService
    .findUCategoryById(categoryid)
    .then((data) => {
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "That category does not exist",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        message: "Could not get that category",
        error: error,
      });
    });
});

router.get("/getname/:nombre", (req, res, next) => {
  const nombre = req.params.nombre;
  categoriesService
    .findByName(nombre)
    .then((data) => {
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "That category does not exist",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        message: "Could not get that category",
        error: error,
      });
    });
});

router.post("/post", tokenAuthentication, checkTipo([0]), (req, res, next) => {
  const category = {
    nombre: req.body.nombre,
  };

  try {
    categoriesService.createCategory(category).then((data) => {
      console.log(data);
      if (data) {
        return res.status(201).json({
          message: "New category created",
        });
      } else {
        return res.status(422).json({
          message: "Could not create the category",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Could not create the category",
      error: error.message,
    });
  }
});

router.put("/put/:categoryid", tokenAuthentication, checkTipo([0]), (req, res, next) => {
  const categoryid = req.params.categoryid;
  categoriesService
    .updateCategory(categoryid, req.body)
    .then((data) => {
      if (!data) {
        return res.status(400).json({
          message: "Category update empty",
        });
      } else {
        return res.status(200).json({
          message: "Category updated successfully",
          user: data,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({
        message: "Category update failed",
        error: error,
      });
    });
});

router.delete("/delete/:categoryid", tokenAuthentication, checkTipo([0]), (req, res, next) => {
  const categoryid = req.params.categoryid;

  categoriesService
    .deleteCategory(categoryid)
    .then((data) => {
      if (data) {
        return res.status(200).json({
          message: "Category deleted",
        });
      } else {
        res.status(400).json({
          message: "Could not delete category",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        message: "Could not delete category",
        error: error.message,
      });
    });
});

module.exports = router;
