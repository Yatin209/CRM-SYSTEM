import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import DataTable from "../components/common/DataTable.jsx";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { customerCategories } from "../data/mockData.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { formatCurrency, statusTone } from "../utils/formatters.js";

const schema = z.object({
  name: z.string().min(2, "Customer name is required"),
  company: z.string().min(2, "Company is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(4, "Address is required"),
  category: z.string(),
  owner: z.string().min(2, "Owner is required"),
  value: z.coerce.number().min(1, "Value is required"),
  notes: z.string().min(3, "Notes are required"),
});

const categories = ["All", ...customerCategories];

function CustomersPage() {
  const { customers, users, addCustomer, updateCustomer, deleteCustomer } =
    useCrmData();
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrator";
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const debouncedQuery = useDebouncedValue(query);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "Mid Market",
      owner: "Rohan Iyer",
    },
  });

  const filtered = useMemo(() => {
    const needle = debouncedQuery.toLowerCase();
    return customers.filter((customer) => {
      const matchesQuery = [
        customer.name,
        customer.company,
        customer.email,
        customer.owner,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      const matchesCategory =
        category === "All" || customer.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, customers, debouncedQuery]);

  function onSubmit(values) {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, values);
    } else {
      addCustomer(values);
    }
    reset();
    setEditingCustomer(null);
    setOpen(false);
  }

  function openEdit(customer) {
    setEditingCustomer(customer);
    reset(customer);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingCustomer(null);
    reset({ category: "Mid Market", owner: "Rohan Iyer" });
  }

  function handleDelete(customer) {
    if (!isAdmin) return;
    if (
      window.confirm(
        `Delete customer "${customer.company}"? This data will be deleted.`,
      )
    ) {
      deleteCustomer(customer.id);
    }
  }

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (customer) => (
        <div className="cell-title">
          <strong>{customer.company}</strong>
          <span>{customer.name}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (customer) => <Badge tone="primary">{customer.category}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (customer) => (
        <Badge tone={statusTone(customer.status)}>{customer.status}</Badge>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (customer) => formatCurrency(customer.value),
    },
    { key: "owner", header: "Owner" },
    {
      key: "actions",

      header: "Actions",

      render: (customer) => (
        <div className="row-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(`/customers/${customer._id || customer.id}`)
            }
          >
            View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            onClick={() => openEdit(customer)}
          >
            Edit
          </Button>

          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => handleDelete(customer)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Customers"
        eyebrow="Accounts and retention"
        actions={
          <Button icon={Plus} onClick={() => setOpen(true)}>
            Add Customer
          </Button>
        }
      />

      <section className="surface">
        <div className="toolbar">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search customers"
          />
          <select
            className="form-select compact-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No customers found"
        />
      </section>

      <Modal
        open={open}
        title={editingCustomer ? "Edit customer" : "Add customer"}
        onClose={closeModal}
      >
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Customer name" error={errors.name}>
              <input {...register("name")} />
            </FormField>
            <FormField label="Company" error={errors.company}>
              <input {...register("company")} />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <input {...register("email")} />
            </FormField>
            <FormField label="Phone" error={errors.phone}>
              <input {...register("phone")} />
            </FormField>
            <FormField label="Category" error={errors.category}>
              <select {...register("category")}>
                {categories
                  .filter((item) => item !== "All")
                  .map((item) => (
                    <option key={item}>{item}</option>
                  ))}
              </select>
            </FormField>
            <FormField label="Owner" error={errors.owner}>
              <select {...register("owner")}>
                {users.map((user) => (
                  <option key={user.id}>{user.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Value" error={errors.value}>
              <input type="number" {...register("value")} />
            </FormField>
          </div>
          <FormField label="Address" error={errors.address}>
            <input {...register("address")} />
          </FormField>
          <FormField label="Notes" error={errors.notes}>
            <textarea rows="3" {...register("notes")} />
          </FormField>
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" icon={Plus}>
              {editingCustomer ? "Save Changes" : "Save Customer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CustomersPage;
