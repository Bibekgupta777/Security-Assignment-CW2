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
import axios from "axios";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    distance: "",
    duration: "",
  });

  const token = localStorage.getItem("token");

  // Fetch routes
  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/route/all");
      setRoutes(response.data.data);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { source, destination, distance, duration } = formData;
    if (!source || !destination || !distance || !duration) {
      alert("All fields are required.");
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      const response = await axios.post("/api/route/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        setFormData({ source: "", destination: "", distance: "", duration: "" });
        setIsAddModalOpen(false);
        fetchRoutes();
      }
    } catch (error) {
      console.error("Error adding route:", error);
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    try {
      const response = await axios.put(
        `/api/route/${selectedRoute._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setFormData({ source: "", destination: "", distance: "", duration: "" });
        setIsEditModalOpen(false);
        fetchRoutes();
      }
    } catch (error) {
      console.error("Error updating route:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/route/${selectedRoute._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        fetchRoutes();
      }
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Route Management</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Route
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Distance (km)</TableHead>
                <TableHead>Duration (hrs)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route._id}>
                  <TableCell>{route.source}</TableCell>
                  <TableCell>{route.destination}</TableCell>
                  <TableCell>{route.distance}</TableCell>
                  <TableCell>{route.duration}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedRoute(route);
                          setFormData(route);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          setSelectedRoute(route);
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
        )}
      </div>

      {/* Add/Edit/Delete Modals */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label>Source</label>
              <Input
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="Enter source"
              />
            </div>
            <div>
              <label>Destination</label>
              <Input
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Enter destination"
              />
            </div>
            <div>
              <label>Distance (km)</label>
              <Input
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleInputChange}
                placeholder="Enter distance"
              />
            </div>
            <div>
              <label>Duration (hrs)</label>
              <Input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Enter duration"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label>Source</label>
              <Input
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="Enter source"
              />
            </div>
            <div>
              <label>Destination</label>
              <Input
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="Enter destination"
              />
            </div>
            <div>
              <label>Distance (km)</label>
              <Input
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleInputChange}
                placeholder="Enter distance"
              />
            </div>
            <div>
              <label>Duration (hrs)</label>
              <Input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Enter duration"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this route? This action cannot be undone.</p>
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

export default RouteManagement;
