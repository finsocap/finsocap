import { Router } from "express";
import {
  getAllClients,
  createClient,
  updateClient,
  getAllLicences,
  updateLicence,
  deleteLicence,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/crmController.js";

const router = Router();

// Clients
router.get("/clients", getAllClients);
router.post("/clients", createClient);
router.put("/clients/:id", updateClient);

// Licences
router.get("/licences", getAllLicences);
router.put("/licences/:id", updateLicence);
router.delete("/licences/:id", deleteLicence);

// Team Users
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
