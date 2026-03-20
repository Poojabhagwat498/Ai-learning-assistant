import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Video,
  Trash,
  Users,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";

const API = "http://localhost:8000/api";

const GroupStudy = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [openAddMember, setOpenAddMember] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ================= FETCH =================
  useEffect(() => {

    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (error) {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  // ================= CREATE GROUP =================
  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Enter group name");
      return;
    }

    try {
      await axios.post(
        `${API}/groups`,
        { name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Group created");
      setGroupName("");
      fetchGroups();
    } catch (error) {
      toast.error("Create failed");
    }
  };

  // ================= SEND REQUEST (UPDATED) =================
  const addMembers = async (groupId) => {
    const selected = selectedUsers[groupId] || [];

    if (selected.length === 0) {
      toast.error("Select users first");
      return;
    }

    try {
      await Promise.all(
        selected.map((userId) =>
          axios.post(
            `${API}/groups/${groupId}/request`,
            { userId },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      toast.success("Request sent");

      setSelectedUsers((prev) => ({ ...prev, [groupId]: [] }));
      setOpenAddMember((prev) => ({ ...prev, [groupId]: false }));

    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  // ================= REMOVE MEMBER =================
  const removeMember = async (groupId, userId) => {
    try {
      await axios.delete(
        `${API}/groups/${groupId}/members/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Removed");
      fetchGroups();
    } catch (error) {
      toast.error("Remove failed");
    }
  };

  // ================= DELETE GROUP =================
  const deleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group?")) return;

    try {
      await axios.delete(`${API}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Group deleted");
      fetchGroups();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ================= JOIN VIDEO =================
  const joinGroup = (groupId) => {
    // 🚀 Only navigate (Socket handled inside VideoRoom)
    navigate(`/video/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Group Study
          </h1>
          <p className="text-slate-500">
            Create and collaborate with your study groups
          </p>
        </div>

        {/* CREATE GROUP */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Plus size={18} /> Create New Group
          </h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
            />

            <button
              onClick={createGroup}
              className="h-11 px-5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
            >
              Create
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-center text-slate-500">Loading groups...</p>
        )}

        {/* EMPTY */}
        {!loading && groups.length === 0 && (
          <p className="text-center text-slate-400">
            No groups found 🚀
          </p>
        )}

        {/* GROUP LIST */}
        <div className="grid gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users size={18} /> {group.name}
                </h2>

                <div className="flex gap-2">
                  {/* 🎥 JOIN VIDEO */}
                  <button
                    onClick={() => joinGroup(group._id)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Video size={16} />
                  </button>

                  {/* 🗑 DELETE */}
                  <button
                    onClick={() => deleteGroup(group._id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* MEMBERS */}
              <div>
                <h3 className="font-medium mb-2">Members</h3>

                <div className="space-y-2">
                  {group.members?.length > 0 ? (
                    group.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm">
                          {member.name} ({member.email})
                        </span>

                        <button
                          onClick={() =>
                            removeMember(group._id, member._id)
                          }
                          className="text-red-500 text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      No members yet
                    </p>
                  )}
                </div>
              </div>

              {/* ADD MEMBERS */}
              <button
                onClick={() =>
                  setOpenAddMember((prev) => ({
                    ...prev,
                    [group._id]: !prev[group._id],
                  }))
                }
                className="flex items-center gap-2 text-emerald-600 font-medium"
              >
                <UserPlus size={16} /> Add Members
              </button>

              {/* DROPDOWN */}
              {openAddMember[group._id] && (
                <div className="flex gap-3">
                  <select
                    multiple
                    size={4}
                    value={selectedUsers[group._id] || []}
                    onChange={(e) =>
                      setSelectedUsers((prev) => ({
                        ...prev,
                        [group._id]: Array.from(
                          e.target.selectedOptions,
                          (o) => o.value
                        ),
                      }))
                    }
                    className="flex-1 border rounded-lg p-2 max-h-32 overflow-y-auto"
                  >
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => addMembers(group._id)}
                    className="bg-emerald-500 text-white px-4 rounded-lg hover:bg-emerald-600"
                  >
                    Send Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupStudy;