"use client";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";

const AddCircleSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Circle name must be at least 3 characters")
    .max(50, "Circle name must be at most 50 characters")
    .required("Circle name is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must be at most 300 characters")
    .required("Description is required"),
});

const AddCircle = () => {
  const router = useRouter();

  const circleForm = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: AddCircleSchema,
    onSubmit: (values, { resetForm, setSubmitting }) => {
      const token = localStorage.getItem("token");

      // Decode JWT payload to extract the logged-in user_id as admin
      const payload = token
        ? JSON.parse(atob(token.split(".")[1]))
        : null;

      axios
        .post(
          "http://localhost:5000/circle/add",
          { ...values, admin: payload?._id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          resetForm();
          toast.success("Circle created successfully!");
          router.push("/browse-circle");
        })
        .catch((err) => {
          console.error(err);
          if (err.response?.status === 401 || err.response?.status === 403) {
            toast.error("Session expired. Please log in again.");
            router.push("/login");
          } else {
            toast.error("Something went wrong. Please try again.");
          }
          setSubmitting(false);
        });
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create a Circle</h1>
          <p className="mt-2 text-sm text-gray-500">
            Bring people together around shared interests.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={circleForm.handleSubmit} noValidate>
            {/* Circle Name */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block mb-1.5 text-sm font-medium text-gray-700"
              >
                Circle Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={circleForm.values.name}
                onChange={circleForm.handleChange}
                onBlur={circleForm.handleBlur}
                placeholder="e.g. Photography Enthusiasts"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  circleForm.errors.name && circleForm.touched.name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {circleForm.errors.name && circleForm.touched.name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {circleForm.errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <label
                htmlFor="description"
                className="block mb-1.5 text-sm font-medium text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={circleForm.values.description}
                onChange={circleForm.handleChange}
                onBlur={circleForm.handleBlur}
                placeholder="What is this circle about? What will members gain by joining?"
                className={`w-full px-4 py-3 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  circleForm.errors.description && circleForm.touched.description
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <div className="flex justify-between mt-1.5">
                {circleForm.errors.description && circleForm.touched.description ? (
                  <p className="text-xs text-red-600">
                    {circleForm.errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {circleForm.values.description.length}/300
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              id="submit-add-circle"
              type="submit"
              disabled={circleForm.isSubmitting}
              className="w-full py-3 px-4 inline-flex justify-center items-center gap-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {circleForm.isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Creating Circle...
                </>
              ) : (
                "Create Circle"
              )}
            </button>

            {/* Back link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Changed your mind?{" "}
              <a
                href="/browse-circle"
                className="text-blue-600 font-medium hover:underline"
              >
                Browse circles
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCircle;
