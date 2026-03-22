import Group from "../models/Group.js";
import GroupRequest from "../models/GroupRequest.js";
import { io } from "../server.js";

// ================= CREATE GROUP =================
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await Group.create({
      name: name.trim(),
      members: [req.user.id],
    });

    const populated = await group.populate("members", "name email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET GROUPS =================
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.id,
    }).populate("members", "name email");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SEND REQUEST =================
export const sendRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: "Group not found" });

    // only members can send
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // prevent duplicate request
    const existing = await GroupRequest.findOne({
      groupId,
      receiver: userId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = await GroupRequest.create({
      groupId,
      sender: req.user.id,
      receiver: userId,
    });

  // 🔥 SEND REAL-TIME TO THAT USER ONLY
    io.to(userId).emit("newRequest", {
      message: "You have a new group request",
    });

    res.json({ message: "Request sent", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET MY REQUESTS =================
export const getRequests = async (req, res) => {
  try {
    const requests = await GroupRequest.find({
      receiver: req.user.id,
      status: "pending",
    }).populate("groupId sender");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= ACCEPT =================
export const acceptRequest = async (req, res) => {
  try {
    const request = await GroupRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: "Not found" });

    request.status = "accepted";
    await request.save();

    await Group.findByIdAndUpdate(request.groupId, {
      $addToSet: { members: request.receiver },
    });

   io.to(request.receiver.toString()).emit("requestAccepted", {
  groupId: request.groupId,
});
res.json({
  message: "Joined group",
  groupId: request.groupId,
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REJECT =================
export const rejectRequest = async (req, res) => {
  try {
    const request = await GroupRequest.findById(req.params.id);

    request.status = "rejected";
    await request.save();

    res.json({ message: "Rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REMOVE MEMBER =================
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    group.members = group.members.filter(
      (m) => m.toString() !== userId
    );

    await group.save();

    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE GROUP =================
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) return res.status(404).json({ message: "Not found" });

    if (group.members[0].toString() !== req.user.id) {
      return res.status(403).json({ message: "Only creator can delete" });
    }

    await group.deleteOne();

    res.json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};