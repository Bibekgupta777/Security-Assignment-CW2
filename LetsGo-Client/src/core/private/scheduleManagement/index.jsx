import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    bus_id: "",
    route_id: "",
    departure_time: "",
    arrival_time: "",
    fare: "",
  });
  const token = localStorage.getItem("token");

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      const response = await axios.get("/api/schedule/get");
      setSchedules(response.data.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  // Fetch buses and routes for dropdowns
  const fetchDropdownData = async () => {
    try {
      const busResponse = await axios.get("/api/bus/all");
      const routeResponse = await axios.get("/api/route/all");
      setBuses(busResponse.data.data);
      setRoutes(routeResponse.data.data);
    } catch (error) {
      console.error("Error fetching buses/routes:", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      const response = await axios.post("/api/schedule/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        setIsAddModalOpen(false);
        fetchSchedules();
        setFormData({
          bus_id: "",
          route_id: "",
          departure_time: "",
          arrival_time: "",
          fare: "",
        });
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(
        `/api/schedule/${selectedSchedule._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setIsEditModalOpen(false);
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `/api/schedule/${selectedSchedule._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Schedule
        </Button>
      </div>

      {/* Schedule Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Fare</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule._id}>
                <TableCell>{schedule.bus_id?.bus_number}</TableCell>
                <TableCell>
                  {schedule.route_id?.source} - {schedule.route_id?.destination}
                </TableCell>
                <TableCell>
                  {new Date(schedule.departure_time).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(schedule.arrival_time).toLocaleString()}
                </TableCell>
                <TableCell>{schedule.fare}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setFormData({
                          bus_id: schedule.bus_id?._id,
                          route_id: schedule.route_id?._id,
                          departure_time: schedule.departure_time,
                          arrival_time: schedule.arrival_time,
                          fare: schedule.fare,
                        });
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Schedule Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label>Bus</label>
              <select
                name="bus_id"
                value={formData.bus_id}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Select Bus</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.bus_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Route</label>
              <select
                name="route_id"
                value={formData.route_id}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.source} - {route.destination}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Departure Time</label>
              <Input
                name="departure_time"
                type="datetime-local"
                value={formData.departure_time}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)} // Disables past dates and times
              />
            </div>
            <div>
              <label>Arrival Time</label>
              <Input
                name="arrival_time"
                type="datetime-local"
                value={formData.arrival_time}
                onChange={handleInputChange}
                min={formData.departure_time || new Date().toISOString().slice(0, 16)} // Ensures arrival time is after departure
              />
            </div>
            <div>
              <label>Fare</label>
              <Input
                name="fare"
                type="number"
                value={formData.fare}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label>Bus</label>
              <select
                name="bus_id"
                value={formData.bus_id}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Select Bus</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.bus_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Route</label>
              <select
                name="route_id"
                value={formData.route_id}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-2"
              >
                <option value="">Select Route</option>
                {routes.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.source} - {route.destination}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Departure Time</label>
              <Input
                name="departure_time"
                type="datetime-local"
                value={formData.departure_time}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)} // Disables past dates and times
              />
            </div>
            <div>
              <label>Arrival Time</label>
              <Input
                name="arrival_time"
                type="datetime-local"
                value={formData.arrival_time}
                onChange={handleInputChange}
                min={formData.departure_time || new Date().toISOString().slice(0, 16)} // Ensures arrival time is after departure
              />
            </div>
            <div>
              <label>Fare</label>
              <Input
                name="fare"
                type="number"
                value={formData.fare}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this schedule? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManagement;