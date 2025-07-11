import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/payment/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayments(response.data.data);
      setFilteredPayments(response.data.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Search payments by booking ID or user ID
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredPayments(
      payments.filter(
        (payment) =>
          payment.booking_id.toLowerCase().includes(term) ||
          payment.user_id.toLowerCase().includes(term)
      )
    );
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <input
          type="text"
          placeholder="Search by Booking ID or User ID"
          value={searchTerm}
          onChange={handleSearch}
          className="border rounded px-4 py-2 w-72"
        />
      </div>

      {/* Payment Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{payment.booking_id?._id || "N/A"}</TableCell>
                <TableCell>{payment.user_id?.name || "N/A"}</TableCell>
                <TableCell>Rs {payment.amount}</TableCell>
                <TableCell>Card</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-2">
              <p>
                <strong>Booking ID:</strong> {selectedPayment.booking_id}
              </p>
              <p>
                <strong>User ID:</strong> {selectedPayment.user_id}
              </p>
              <p>
                <strong>Amount:</strong> ${selectedPayment.amount}
              </p>
              <p>
                <strong>Payment Method:</strong>{" "}
                {selectedPayment.payment_method}
              </p>
              <p>
                <strong>Status:</strong> {selectedPayment.status}
              </p>
              <p>
                <strong>Transaction ID:</strong>{" "}
                {selectedPayment.transaction_id}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedPayment.createdAt).toLocaleString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;