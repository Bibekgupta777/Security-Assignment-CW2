import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User, Calendar } from "lucide-react";

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/api/contact");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`/api/contact/${id}`);
      setMessages(messages.filter((message) => message._id !== id));
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">📩 Contact Messages</h1>

      {loading ? (
        <p className="text-center text-lg text-gray-500">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No messages found.</p>
      ) : (
        <Card className="shadow-xl border border-gray-300 rounded-2xl bg-white">
          <CardContent className="p-6 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message</th>
                  <th className="p-4 text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message, index) => (
                  <tr
                    key={message._id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition-colors border-b cursor-pointer`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <td className="p-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      {message.name}
                    </td>
                    <td className="p-4">
                      <a
                        href={`mailto:${message.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-4 h-4" />
                        {message.email}
                      </a>
                    </td>
                    <td className="p-4">{message.subject}</td>
                    <td className="p-4 max-w-md truncate">
                      {message.message.length > 80 ? (
                        <span title={message.message}>{message.message.slice(0, 80)}...</span>
                      ) : (
                        message.message
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Calendar className="inline w-4 h-4 mr-1 text-gray-500" />
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {selectedMessage && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Message Details</h2>
            <p><strong>Name:</strong> {selectedMessage.name}</p>
            <p><strong>Email:</strong> {selectedMessage.email}</p>
            <p><strong>Subject:</strong> {selectedMessage.subject}</p>
            <p><strong>Message:</strong> {selectedMessage.message}</p>
            <p><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleDateString()}</p>
            <div className="flex justify-end gap-4 mt-4">
              <button 
                onClick={() => setSelectedMessage(null)} 
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
              <button 
                onClick={() => deleteMessage(selectedMessage._id)} 
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;