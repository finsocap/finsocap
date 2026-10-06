import { Router } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  addTaskComment,
  completeTaskWithLicence,
} from "../controllers/taskController.js";

const router = Router();

router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.post("/:id/comments", addTaskComment);
router.post("/:id/complete", completeTaskWithLicence);

export default router;
