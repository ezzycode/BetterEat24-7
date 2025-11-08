"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Upload,
  X,
  Camera,
  Video,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export default function FarmerDashboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price_per_unit: "",
    unit_type: "kg",
    quantity_available: "",
    harvest_date: "",
    expiry_date: "",
    is_organic: false,
  });

  const queryClient = useQueryClient();

  // Mock farmer ID - in real app this would come from auth
  const farmerId = 1;

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Fetch farmer's produce
  const { data: produce = [], isLoading } = useQuery({
    queryKey: ["farmer-produce", farmerId],
    queryFn: async () => {
      const response = await fetch(`/api/produce?farmer_id=${farmerId}`);
      if (!response.ok) throw new Error("Failed to fetch produce");
      return response.json();
    },
  });

  // Create produce mutation
  const createProduceMutation = useMutation({
    mutationFn: async (produceData) => {
      const response = await fetch("/api/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...produceData, farmer_id: farmerId }),
      });
      if (!response.ok) throw new Error("Failed to create produce");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-produce", farmerId] });
      setShowAddForm(false);
      resetForm();
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async ({ produceId, file, mediaType, isPrimary }) => {
      // First upload the file
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");
      const { url } = await uploadResponse.json();

      // Then save media record
      const mediaResponse = await fetch("/api/produce-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produce_id: produceId,
          media_url: url,
          media_type: mediaType,
          is_primary: isPrimary,
        }),
      });

      if (!mediaResponse.ok) throw new Error("Failed to save media");
      return mediaResponse.json();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      price_per_unit: "",
      unit_type: "kg",
      quantity_available: "",
      harvest_date: "",
      expiry_date: "",
      is_organic: false,
    });
    setSelectedFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const fileObjects = files.map((file) => ({
      file,
      type: file.type.startsWith("image/") ? "image" : "video",
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      name: file.name,
    }));
    setSelectedFiles((prev) => [...prev, ...fileObjects]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create the produce first
      const newProduce = await createProduceMutation.mutateAsync(formData);

      // Upload media files
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await uploadMediaMutation.mutateAsync({
          produceId: newProduce.id,
          file: file.file,
          mediaType: file.type,
          isPrimary: i === 0, // First file is primary
        });
      }
    } catch (error) {
      console.error("Error creating produce:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-green-600">
                Farmer Dashboard
              </h1>
              <p className="text-gray-600">Manage your farm produce listings</p>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Produce
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Produce Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Add New Produce</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produce Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Fresh Tomatoes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category_id: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe your produce..."
                    />
                  </div>

                  {/* Pricing and Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Unit *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price_per_unit}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price_per_unit: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Type *
                      </label>
                      <select
                        required
                        value={formData.unit_type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            unit_type: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="kg">Kilogram (kg)</option>
                        <option value="lb">Pound (lb)</option>
                        <option value="piece">Piece</option>
                        <option value="bunch">Bunch</option>
                        <option value="dozen">Dozen</option>
                        <option value="liter">Liter</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Available *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.quantity_available}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            quantity_available: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harvest Date
                      </label>
                      <input
                        type="date"
                        value={formData.harvest_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            harvest_date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            expiry_date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Organic Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_organic"
                      checked={formData.is_organic}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_organic: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="is_organic"
                      className="ml-2 text-sm text-gray-700"
                    >
                      This is organic produce
                    </label>
                  </div>

                  {/* Media Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photos & Videos
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          Click to upload photos and videos
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, MP4 up to 10MB each
                        </p>
                      </label>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {file.type === "image" ? (
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createProduceMutation.isLoading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {createProduceMutation.isLoading
                        ? "Adding..."
                        : "Add Produce"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Produce List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Your Produce Listings
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your produce...</p>
            </div>
          ) : produce.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">No produce listed yet.</p>
              <p className="text-gray-500 mt-2">
                Add your first produce to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produce.map((item) => {
                const primaryImage =
                  item.media?.find(
                    (m) => m.is_primary && m.media_type === "image",
                  ) || item.media?.find((m) => m.media_type === "image");

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="h-48 bg-gray-200 relative">
                      {primaryImage ? (
                        <img
                          src={primaryImage.media_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera className="h-12 w-12" />
                        </div>
                      )}
                      {item.is_organic && (
                        <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Organic
                        </span>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {item.media?.filter((m) => m.media_type === "image")
                          .length > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {
                              item.media.filter((m) => m.media_type === "image")
                                .length
                            }
                          </span>
                        )}
                        {item.media?.filter((m) => m.media_type === "video")
                          .length > 0 && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {
                              item.media.filter((m) => m.media_type === "video")
                                .length
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.category_name}
                      </p>

                      {/* Price and Quantity */}
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="text-xl font-bold text-green-600">
                            ${item.price_per_unit}
                          </span>
                          <span className="text-gray-500 text-sm">
                            /{item.unit_type}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {item.quantity_available} available
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="text-sm text-gray-500 mb-3">
                        {item.harvest_date && (
                          <div>Harvested: {formatDate(item.harvest_date)}</div>
                        )}
                        {item.expiry_date && (
                          <div>Expires: {formatDate(item.expiry_date)}</div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
