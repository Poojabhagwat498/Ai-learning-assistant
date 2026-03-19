import express from "express";
import {
  createGroup,
  getGroups,
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  removeMember,
  deleteGroup,
} from "../controllers/groupController.js";

import protect from "../middleware/auth.js";

const router = express.Router();

// GROUP
router.post("/", protect, createGroup);
router.get("/", protect, getGroups);
router.delete("/:groupId", protect, deleteGroup);

// REQUEST SYSTEM
router.post("/:groupId/request", protect, sendRequest);
router.get("/requests", protect, getRequests);
router.put("/requests/:id/accept", protect, acceptRequest);
router.put("/requests/:id/reject", protect, rejectRequest);

// MEMBERS
router.delete("/:groupId/members/:userId", protect, removeMember);

export default router;