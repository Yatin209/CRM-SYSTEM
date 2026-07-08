import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "./Button.jsx";
import FormField from "./FormField.jsx";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[!@#$%^&*]/, "Must contain a special character"),
    confirmPassword: z.string(),
    role: z.enum(
      [
        "Administrator",
        "Manager",
        "Sales Executive",
        "Customer Support Executive",
      ],
      { errorMap: () => ({ message: "Please select a valid role" }) },
    ),
    region: z.string().min(1, "Region is required"),
    status: z.enum(["Active", "Inactive"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function AddUserModal({ isOpen, onClose, onSubmit, isLoading = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "Active",
      role: "Sales Executive",
      region: "Global",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    // Don't send confirmPassword to API
    // eslint-disable-next-line no-unused-vars -- destructured only to omit it from the payload
    const { confirmPassword, ...userData } = data;
    await onSubmit(userData);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-nexa">
      <div className="modal-panel">
        <div className="modal-head">
          <h2>Add New User</h2>
          <button
            type="button"
            onClick={handleClose}
            className="icon-button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="modal-form">
          <FormField label="Full Name" error={errors.name}>
            <input
              {...register("name")}
              type="text"
              placeholder="John Doe"
              disabled={isSubmitting || isLoading}
            />
          </FormField>

          <FormField label="Email Address" error={errors.email}>
            <input
              {...register("email")}
              type="email"
              placeholder="john@company.com"
              disabled={isSubmitting || isLoading}
            />
          </FormField>

          <div className="form-grid">
            <FormField label="Password" error={errors.password}>
              <div className="input-with-icon password-input-wrapper">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  className="icon-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  tabIndex={-1}
                >
                  {showPassword ? "👁‍🗨" : "👁"}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword}>
              <div className="input-with-icon password-input-wrapper">
                <input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  className="icon-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle password visibility"
                  tabIndex={-1}
                >
                  {showConfirm ? "👁‍🗨" : "👁"}
                </button>
              </div>
            </FormField>
          </div>

          <div className="form-grid">
            <FormField label="Role" error={errors.role}>
              <select
                {...register("role")}
                disabled={isSubmitting || isLoading}
              >
                <option value="Sales Executive">Sales Executive</option>
                <option value="Manager">Manager</option>
                <option value="Administrator">Administrator</option>
                <option value="Customer Support Executive">
                  Customer Support Executive
                </option>
              </select>
            </FormField>

            <FormField label="Region" error={errors.region}>
              <select
                {...register("region")}
                disabled={isSubmitting || isLoading}
              >
                <option value="Global">Global</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="India">India</option>
              </select>
            </FormField>
          </div>

          <FormField label="Status" error={errors.status}>
            <select
              {...register("status")}
              disabled={isSubmitting || isLoading}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </FormField>

          <div className="modal-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
