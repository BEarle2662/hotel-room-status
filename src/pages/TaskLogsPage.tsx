import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Room, Task } from '../types/room';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Calendar, Check, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TaskWithRoom extends Task {
  roomNumber: string;
  floor: number;
}

export default function TaskLogsPage() {
  const [tasks, setTasks] = useState<TaskWithRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [filteredTasks, setFilteredTasks] = useState<TaskWithRoom[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const roomsCollection = collection(db, 'rooms');
      const snapshot = await getDocs(roomsCollection);
      const allTasks: TaskWithRoom[] = [];
      
      snapshot.docs.forEach(doc => {
        const roomData = doc.data();
        const room = { 
          ...roomData, 
          id: doc.id,
          tasks: roomData.tasks || []
        } as Room;
        
        room.tasks.forEach(task => {
          allTasks.push({
            ...task,
            roomNumber: room.number,
            floor: room.floor,
          });
        });
      });

      const sortedTasks = allTasks.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setTasks(sortedTasks);
      setFilteredTasks(sortedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks;
    
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedFloor !== 'all') {
      filtered = filtered.filter(task => task.floor === selectedFloor);
    }
    
    setFilteredTasks(filtered);
  }, [searchQuery, selectedFloor, tasks]);

  const handleDeleteTask = async (taskId: string, roomNumber: string) => {
    setDeleting(taskId);
    try {
      const roomsSnapshot = await getDocs(collection(db, 'rooms'));
      const roomDoc = roomsSnapshot.docs.find(doc => doc.data().number === roomNumber);
      
      if (roomDoc) {
        const roomData = roomDoc.data() as Room;
        const updatedTasks = roomData.tasks.filter(task => task.id !== taskId);
        
        await updateDoc(doc(db, 'rooms', roomDoc.id), {
          tasks: updatedTasks
        });
        
        toast.success('Task deleted successfully');
        fetchTasks(); // Refresh the task list
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setDeleting(null);
    }
  };

  const getTaskStats = () => {
    const completed = filteredTasks.filter(task => task.completed).length;
    const pending = filteredTasks.filter(task => !task.completed).length;
    const byFloor = filteredTasks.reduce((acc, task) => {
      acc[task.floor] = (acc[task.floor] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return { completed, pending, byFloor };
  };

  const stats = getTaskStats();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Task Status</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Tasks by Floor</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.byFloor).map(([floor, count]) => (
              <div key={floor} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Floor {floor}</p>
                <p className="text-2xl font-bold text-gray-700">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by room number or description..."
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="all">All Floors</option>
                {[1, 2, 3, 4].map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {filteredTasks.map(task => (
            <div key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">Room {task.roomNumber}</p>
                  <p className={`text-sm ${task.completed ? 'text-gray-500' : 'text-gray-900'}`}>
                    {task.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(task.startTime), 'MMM d, yyyy HH:mm')}
                    </span>
                    {task.endTime && (
                      <span className="flex items-center">
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                        {format(new Date(task.endTime), 'MMM d, yyyy HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.completed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id, task.roomNumber)}
                    disabled={deleting === task.id}
                    className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}