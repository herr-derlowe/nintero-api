const express = require("express");
const router = express.Router();
const categoriesService = require("../services/categoriesService");
const categoriesSchema = require("../validators/categoriesschemas");
const { tokenAuthentication, checkTipo } = require("../middleware/jwt-auth");

//Get Categories
router.get("/get", tokenAuthentication, checkTipo([0]), (req, res, next) => {
  //res.send("testing category");
  categoriesService.findAllCategories().then((data) => {
    return res.status(200).json(data);
  });
});
//Get Category By Id
router.get(
  "/getid/:categoryid",
  tokenAuthentication,
  checkTipo([0]),
  (req, res, next) => {
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
  }
);
//Get Category By Name
router.get(
  "/getname/:nombre",
  tokenAuthentication,
  checkTipo([0]),
  (req, res, next) => {
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
  }
);
//Create Category
router.post(
  "/post",
  tokenAuthentication,
  checkTipo([0]),
  async (req, res, next) => {
    const category = {
      nombre: req.body.nombre,
    };

    //validators
    try {
      categoriesSchema.categorySchema.validateSync(category, {
        abortEarly: false,
      });
    } catch (error) {
      if (error.errors !== undefined) {
        return res.status(422).json({
          error: error.errors,
        });
      }
    }

    //create
    try {
      const find_name = await categoriesService.findName(category.nombre);

      if (find_name.found) {
        return res.status(422).json(find_name);
      }

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
  }
);
//Update Category
router.put(
  "/put/:categoryid",
  tokenAuthentication,
  checkTipo([0]),
  async (req, res, next) => {
    const categoryid = req.params.categoryid;

    //validators
    try {
      categoriesSchema.categorySchema.validateSync(req.body, {
        abortEarly: false,
      });
    } catch (error) {
      if (error.errors !== undefined) {
        return res.status(422).json({
          error: error.errors,
        });
      }
    }

    const find_name = await categoriesService.findName(req.body.nombre);

    if (find_name.found) {
      return res.status(422).json(find_name);
    }

    //update
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
  }
);
//Delete Category
router.delete(
  "/delete/:categoryid",
  tokenAuthentication,
  checkTipo([0]),
  (req, res, next) => {
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
  }
);

module.exports = router;
