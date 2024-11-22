import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Room, RoomStatus } from "../types/room";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFloors, setExpandedFloors] = useState<number[]>([1]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsCollection = collection(db, "rooms");
        const snapshot = await getDocs(roomsCollection);
        const roomsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          tasks: doc.data().tasks || [],
        })) as Room[];
        setRooms(
          roomsData.sort(
            (a, b) => a.floor - b.floor || a.number.localeCompare(b.number)
          )
        );
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const getRoomsByStatus = (status: RoomStatus) =>
    rooms.filter((room) => room.status === status).length;

  const getRoomsByFloor = (floor: number) =>
    rooms.filter((room) => room.floor === floor).length;

  const toggleFloor = (floor: number) => {
    setExpandedFloors((prev) =>
      prev.includes(floor) ? prev.filter((f) => f !== floor) : [...prev, floor]
    );
  };

  const getRoomsByFloorNumber = (floor: number) =>
    rooms.filter((room) => room.floor === floor);

  if (loading) return <LoadingSpinner />;
  console.log(rooms);
  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Status Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                "needs-cleaning",
                "cleaned",
                "vacated",
                "occupied",
              ] as RoomStatus[]
            ).map((status) => (
              <div
                key={status}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <StatusBadge status={status} />
                <span className="font-semibold">
                  {getRoomsByStatus(status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Floor Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((floor) => (
              <div
                key={floor}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm font-medium">Floor {floor}</span>
                <span className="font-semibold">{getRoomsByFloor(floor)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rooms by Floor */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((floor) => (
          <div key={floor} className="bg-white rounded-lg shadow">
            <button
              onClick={() => toggleFloor(floor)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-semibold">Floor {floor}</h3>
              {expandedFloors.includes(floor) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedFloors.includes(floor) && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getRoomsByFloorNumber(floor).map((room) => (
                  <Link
                    key={room.id}
                    to={`/room/${room.id}`}
                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold">
                        Room {room.number}{" "}
                        <span className="text-black ml-2 bg-gray-200 rounded-lg text-sm px-4 py-1">
                          {room.roomType}
                        </span>
                      </h4>

                      <StatusBadge status={room.status} />
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <ClipboardList className="w-4 h-4 mr-1" />
                      <span>{room.tasks?.length || 0} Tasks</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
