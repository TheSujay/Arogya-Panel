import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } =
    useContext(DoctorContext);
  const { currency, backendUrl } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        about: profileData.about,
        available: profileData.available,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updateData,
        {
          headers: { dToken },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const handleSignatureSubmit = async () => {
    if (!signatureFile) return toast.warning("Please select a signature file");

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("signature", signatureFile);
      formData.append("docId", profileData._id);

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/upload-signature`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${dToken}`,
          },
        }
      );

      if (data.success) {
        toast.success("Signature uploaded successfully");
        setSignatureFile(null);
        setConfirmed(false);
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to upload signature");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadSignature = (e) => {
    e.preventDefault();
    if (!signatureFile) return toast.warning("Please select a signature file");

    if (profileData.signature && !confirmed) {
      toast.info(
        `You already uploaded a signature on ${new Date(
          profileData.signatureUploadedAt
        ).toLocaleString()}. Are you sure you want to replace it?`
      );
      setShowConfirmModal(true);
      return;
    }

    handleSignatureSubmit();
  };

  useEffect(() => {
    if (dToken) getProfileData();
  }, [dToken]);

  return (
    profileData && (
      <div className="p-5">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <img
              className="w-full sm:max-w-xs rounded-xl border shadow"
              src={profileData.image}
              alt="Doctor"
            />
          </div>

          <div className="bg-white border rounded-xl shadow p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-600">
                {profileData.degree} - {profileData.speciality}
              </p>
              <span className="inline-block mt-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {profileData.experience} years experience
              </span>
            </div>

            <div>
              <label className="font-medium text-gray-700">About</label>
              {isEdit ? (
                <textarea
                  className="w-full mt-1 border p-2 rounded"
                  rows="4"
                  value={profileData.about}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      about: e.target.value,
                    }))
                  }
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  {profileData.about}
                </p>
              )}
            </div>

            <div>
              <label className="font-medium text-gray-700">
                Appointment Fee
              </label>
              <p className="text-gray-700 mt-1">
                {currency}{" "}
                {isEdit ? (
                  <input
                    type="number"
                    className="border p-1 rounded w-24"
                    value={profileData.fees}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                  />
                ) : (
                  profileData.fees
                )}
              </p>
            </div>

            <div>
              <label className="font-medium text-gray-700">Address</label>
              <div className="text-sm text-gray-700 mt-1 space-y-1">
                {isEdit ? (
                  <>
                    <input
                      type="text"
                      className="w-full border p-1 rounded"
                      value={profileData.address.line1}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="text"
                      className="w-full border p-1 rounded"
                      value={profileData.address.line2}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        }))
                      }
                    />
                  </>
                ) : (
                  <>
                    <p>{profileData.address.line1}</p>
                    <p>{profileData.address.line2}</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={!isEdit}
                checked={profileData.available}
                onChange={() =>
                  isEdit &&
                  setProfileData((prev) => ({
                    ...prev,
                    available: !prev.available,
                  }))
                }
              />
              <label className="text-gray-700 text-sm">Available</label>
            </div>

            <div className="flex gap-3 pt-4">
              {isEdit ? (
                <>
                  <button
                    onClick={updateProfile}
                    className="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEdit(false)}
                    className="border px-4 py-1 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEdit(true)}
                  className="border px-4 py-1 rounded hover:bg-primary hover:text-white transition-all"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Signature Upload Section */}
        <div className="mt-10 bg-white border rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Digital Signature
          </h3>

          <div className="mb-4">
            {profileData.signature ? (
              <>
                <img
                  src={profileData.signature}
                  alt="Signature"
                  className="h-20 object-contain border p-2 rounded"
                />
                <p className="text-sm text-green-600 mt-2 font-medium">
                  ✅ Signature uploaded on{" "}
                  <strong>
                    {new Date(profileData.signatureUploadedAt).toLocaleString()}
                  </strong>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                No signature uploaded yet.
              </p>
            )}
          </div>

          <form
            onSubmit={uploadSignature}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSignatureFile(e.target.files[0])}
              className="border p-1 rounded"
            />
            <button
              type="submit"
              disabled={isUploading}
              className="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload Signature"}
            </button>
          </form>
        </div>

        {/* ✅ Confirmation Modal */}
        {showConfirmModal && (
          <div
            className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 relative z-[1001]">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Replace Existing Signature?
              </h2>
              <p className="text-sm text-gray-600">
                A signature was already uploaded on{" "}
                <strong>
                  {new Date(profileData.signatureUploadedAt).toLocaleString()}
                </strong>
                .
                <br />
                Are you sure you want to replace it?
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-1 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmed(true);
                    setShowConfirmModal(false);
                    handleSignatureSubmit();
                  }}
                  className="px-4 py-1 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Yes, Replace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default DoctorProfile;
