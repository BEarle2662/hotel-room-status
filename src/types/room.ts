export type RoomStatus = "needs-cleaning" | "cleaned" | "vacated" | "occupied";

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  startTime: string;
  endTime?: string;
  roomId: string;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  status: RoomStatus;
  roomType: string;
  tasks: Task[];
}