import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Room, RoomStatus, Task } from "../types/room";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Plus, Check, X, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function RoomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<RoomStatus>("needs-cleaning");

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      try {
        const roomDoc = await getDoc(doc(db, "rooms", id));
        if (roomDoc.exists()) {
          const roomData = {
            ...roomDoc.data(),
            id: roomDoc.id,
            tasks: roomDoc.data().tasks || [],
          } as Room;
          setRoom(roomData);
          setSelectedStatus(roomData.status);
        } else {
          toast.error("Room not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching room:", error);
        toast.error("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, navigate]);

  const handleAddTask = () => {
    if (!room || !newTask.trim()) return;

    const newTaskObj: Task = {
      id: `${room.id}-${Date.now()}`,
      description: newTask.trim(),
      completed: false,
      startTime: new Date().toISOString(),
      roomId: room.id,
    };

    setRoom((prev) =>
      prev
        ? {
            ...prev,
            tasks: [...prev.tasks, newTaskObj],
          }
        : null
    );
    setNewTask("");
  };

  const handleToggleTask = (taskId: string) => {
    if (!room) return;

    setRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        tasks: prev.tasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              completed: !task.completed,
              endTime: !task.completed ? new Date().toISOString() : undefined,
            };
          }
          return task;
        }),
      };
    });
  };

  const handleSave = async () => {
    if (!room || !id) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "rooms", id), {
        status: selectedStatus,
        tasks: room.tasks,
      });
      toast.success("Room updated successfully");
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!room) return <div>Room not found</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Rooms
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Room {room.number}</h1>
            <p className="text-gray-600">Floor {room.floor}</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as RoomStatus)}
              className="px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              {(
                [
                  "needs-cleaning",
                  "cleaned",
                  "vacated",
                  "occupied",
                ] as RoomStatus[]
              ).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <StatusBadge status={selectedStatus} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task..."
              className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-2 py-3"
              onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            />
            <button
              onClick={handleAddTask}
              disabled={!newTask.trim()}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {room.tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No tasks added yet
              </p>
            ) : (
              room.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Started:{" "}
                      {format(new Date(task.startTime), "MMM d, yyyy HH:mm")}
                      {task.endTime && (
                        <>
                          {" "}
                          • Completed:{" "}
                          {format(new Date(task.endTime), "MMM d, yyyy HH:mm")}
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-1 rounded-full ${
                      task.completed
                        ? "text-green-600 hover:text-green-700"
                        : "text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    {task.completed ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
