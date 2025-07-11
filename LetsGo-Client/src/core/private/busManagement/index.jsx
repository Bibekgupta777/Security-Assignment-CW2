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
import { Edit2, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBus, setSelectedBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: "",
    total_seats: "",
  });

  // Fetch buses data
  useEffect(() => {
    fetchBuses();
  }, []);
  const token = localStorage.getItem("token");

  const fetchBuses = async () => {
    try {
      const response = await axios.get("/api/bus/all");
      setBuses(response.data.data);
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async () => {
    try {
      const response = await axios.post("/api/bus/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        setIsAddModalOpen(false);
        fetchBuses();
        setFormData({ bus_number: "", total_seats: "" });
        toast.success("Bus added");
      }
    } catch (error) {
      console.error("Error adding bus:", error.response);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(
        `/api/bus/${selectedBus._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setIsEditModalOpen(false);
        fetchBuses();
        setFormData({ bus_number: "", total_seats: "" });
      }
    } catch (error) {
      console.error("Error updating bus:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/bus/${selectedBus._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setIsDeleteModalOpen(false);
        fetchBuses();
      }
    } catch (error) {
      console.error("Error deleting bus:", error);
    }
  };

  const filteredBuses = buses.filter((bus) =>
    bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bus Management</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Bus
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-60">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search buses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus Number/Bus Name</TableHead>
              <TableHead>Total Seats</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuses.map((bus) => (
              <TableRow key={bus._id}>
                <TableCell>{bus.bus_number}</TableCell>
                <TableCell>{bus.total_seats}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedBus(bus);
                        setFormData(bus);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSelectedBus(bus);
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

      {/* Add Bus Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Bus Number/Bus Name</label>
              <Input
                name="bus_number"
                value={formData.bus_number}
                onChange={handleInputChange}
                placeholder="Enter bus number/bus name"
              />
            </div>
            <div className="space-y-2">
              <label>Total Seats</label>
              <Input
                name="total_seats"
                type="number"
                value={formData.total_seats}
                onChange={handleInputChange}
                placeholder="Enter total seats"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Bus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Bus Number/Bus Name</label>
              <Input
                name="bus_number"
                value={formData.bus_number}
                onChange={handleInputChange}
                placeholder="Enter bus number/bus name"
              />
            </div>
            <div className="space-y-2">
              <label>Total Seats</label>
              <Input
                name="total_seats"
                type="number"
                value={formData.total_seats}
                onChange={handleInputChange}
                placeholder="Enter total seats"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Bus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete this bus? This action cannot be
              undone.
            </p>
          </div>
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

export default BusManagement;