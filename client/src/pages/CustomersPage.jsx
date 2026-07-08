import { Edit3, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import ConfirmPopover from "../components/common/ConfirmPopover.jsx";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import CustomerFormModal from "../components/forms/CustomerFormModal.jsx";
import { ROLES } from "../config/roles.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { formatCurrency, statusTone } from "../utils/formatters.js";

const categories = ["All", "Strategic", "Enterprise", "Mid Market", "SMB"];

function CustomersPage() {
  const { customers, removeCustomer } = useCrmData();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedQuery = useDebouncedValue(query);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.toLowerCase();
    return customers.filter((customer) => {
      const matchesQuery = [customer.name, customer.company, customer.email, customer.owner].join(" ").toLowerCase().includes(needle);
      const matchesCategory = category === "All" || customer.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, customers, debouncedQuery]);

  function openEditor(customer) {
    setEditing(customer);
    setOpen(true);
  }

  function closeEditor() {
    setEditing(null);
    setOpen(false);
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
      )
    },
    { key: "category", header: "Category", render: (customer) => <Badge tone="primary">{customer.category}</Badge> },
    { key: "industry", header: "Industry", render: (customer) => customer.industry || "Other" },
    { key: "status", header: "Status", render: (customer) => <Badge tone={statusTone(customer.status)}>{customer.status}</Badge> },
    { key: "value", header: "Value", render: (customer) => formatCurrency(customer.value) },
    { key: "owner", header: "Owner" },
    {
      key: "actions",
      header: "Actions",
      render: (customer) => (
        <div className="row-actions row-actions-inline">
          <Button size="sm" variant="ghost" icon={Edit3} onClick={() => openEditor(customer)}>
            Edit
          </Button>
          {isAdmin && (
            <ConfirmPopover
              message={`Delete customer "${customer.company}"?`}
              onConfirm={() => removeCustomer(customer.id)}
            >
              {(openConfirm) => (
                <Button size="sm" variant="ghost" icon={Trash2} onClick={openConfirm}>
                  Delete
                </Button>
              )}
            </ConfirmPopover>
          )}
        </div>
      )
    }
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
          <SearchInput value={query} onChange={setQuery} placeholder="Search customers" />
          <select className="form-select compact-select" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No customers found" />
      </section>

      <CustomerFormModal open={open} onClose={closeEditor} editing={editing} />
    </div>
  );
}

export default CustomersPage;
