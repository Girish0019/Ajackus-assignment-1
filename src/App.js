import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Modal, Form, Alert, Pagination } from "react-bootstrap";
import './App.css';  // Import the CSS file

const App = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/users");
      const formattedUsers = response.data.map((user) => ({
        id: user.id,
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ")[1] || "",
        email: user.email,
        department: "General",
      }));
      setUsers(formattedUsers);
    } catch (err) {
      setError("Failed to fetch users.");
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    // Validation: Check if any input field is empty
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setError("All fields must be filled out!");
      return;
    }

    try {
      const newUser = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
      };

      const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
      const newId = maxId + 1;

      newUser.id = newId;

      setUsers((prevUsers) => [...prevUsers, newUser]);
      
      setShowModal(false);
      setFormData({ id: "", firstName: "", lastName: "", email: "", department: "" });
    } catch (err) {
      setError("Failed to add user.");
    }
  };

  const handleEditUser = async () => {
    try {
      const updatedUser = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
      };
      setUsers(users.map((user) => (user.id === formData.id ? updatedUser : user)));
      setEditing(false);
      setShowModal(false);
      setFormData({ id: "", firstName: "", lastName: "", email: "", department: "" });
    } catch (err) {
      setError("Failed to edit user.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError("Failed to delete user.");
    }
  };

  const handleOpenModal = (user = {}) => {
    if (user.id) {
      setEditing(true);
      setFormData({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
      });
    } else {
      setEditing(false);
      setFormData({ id: "", firstName: "", lastName: "", email: "", department: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
  };

  const paginateUsers = () => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return users.slice(startIndex, startIndex + usersPerPage);
  };

  return (
    <div className="container">
      <h2 className="heading">User Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="primary" onClick={() => handleOpenModal()} className="mb-3 add-btn">
        Add User
      </Button>
      <Table striped bordered hover className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginateUsers().map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.department}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleOpenModal(user)} className="edit-btn">
                  Edit
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id)} className="delete-btn">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="pagination">
        {[...Array(Math.ceil(users.length / usersPerPage)).keys()].map((num) => (
          <Pagination.Item key={num} active={num + 1 === currentPage} onClick={() => setCurrentPage(num + 1)}>
            {num + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit User" : "Add User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
                className="form-input"
              />
            </Form.Group>
            <Form.Group controlId="formLastName" className="mt-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                className="form-input"
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="form-input"
              />
            </Form.Group>
            <Form.Group controlId="formDepartment" className="mt-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                className="form-input"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} className="cancel-btn">
            Cancel
          </Button>
          <Button variant="primary" onClick={editing ? handleEditUser : handleAddUser} className="save-btn">
            {editing ? "Save Changes" : "Add User"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;
