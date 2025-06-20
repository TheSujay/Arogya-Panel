// Updated DoctorAppointments.jsx with advanced responsive design for desktop and mobile

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { FaEye, FaSearch } from "react-icons/fa";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
  } = useContext(DoctorContext);

  const { slotDateFormat, calculateAge, currency } = useContext(AppContext);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [showInputModal, setShowInputModal] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [scale, setScale] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const displayAppointments = searchQuery ? searchResults : appointments;

  useEffect(() => {
    if (dToken) getAppointments();
  }, [dToken]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        axios
          .get(`${backendUrl}/api/doctor/search-appointments?query=${searchQuery}`)
          .then((res) => setSearchResults(res.data))
          .catch(() => setSearchResults([]))
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const handleReportSubmit = async () => {
    if (!diagnosis || !prescription || !selectedAppointmentId) {
      toast.error("Please fill in both diagnosis and prescription.");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/doctor/generate-report`, {
        appointmentId: selectedAppointmentId,
        diagnosis,
        prescription,
      });

      if (res.data.success) {
        toast.success("Report Generated Successfully ✅");
        setSelectedAppointmentId(null);
        setDiagnosis("");
        setPrescription("");
        setShowInputModal(false);
        getAppointments();
      }
    } catch (err) {
      toast.error("Failed to generate report ❌");
    }
  };

  const handleViewReport = (reportUrl) => {
    if (!reportUrl) {
      toast.error("Invalid or missing report URL");
      return;
    }
    const fullUrl = new URL(reportUrl, backendUrl).toString();
    setPdfUrl(fullUrl);
    setShowPdfModal(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <p className="text-xl font-semibold">All Appointments</p>
        <div className="flex items-center gap-2 bg-white border rounded px-3 py-1 shadow-sm w-full sm:w-auto">
          <FaSearch className={`text-gray-500 ${isSearching ? "animate-spin" : ""}`} />
          <input
            type="text"
            placeholder="Search by name or ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-none p-1 text-sm flex-1 w-full"
          />
        </div>
      </div>

      {showInputModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-red-500 font-bold text-lg"
              onClick={() => {
                setShowInputModal(false);
                setSelectedAppointmentId(null);
                setDiagnosis("");
                setPrescription("");
              }}
            >✖</button>
            <h2 className="text-lg font-semibold mb-4">Submit Report</h2>
            <textarea
              placeholder="Diagnosis"
              className="border w-full p-2 text-sm mb-2 rounded"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            <textarea
              placeholder="Prescription"
              className="border w-full p-2 text-sm mb-4 rounded"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
            <button
              onClick={handleReportSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm w-full"
            >Submit</button>
          </div>
        </div>
      )}

      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center px-4">
          <div className={`relative rounded-xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h2 className="text-lg font-semibold">📄 Report Preview</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}>➖</button>
                <span className="text-xs">{(scale * 100).toFixed(0)}%</span>
                <button onClick={() => setScale((s) => Math.min(s + 0.1, 2))}>➕</button>
                <button onClick={() => window.open(pdfUrl, "_blank")}>🖨️</button>
                <a href={pdfUrl} download className="text-blue-600">📥</a>
                <button onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? "☀️" : "🌙"}</button>
                <button onClick={() => { setShowPdfModal(false); setPdfUrl(""); }}>✖</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto px-4 py-2">
              {pdfUrl ? (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<p className="text-center">Loading PDF...</p>}
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div key={`page_${index + 1}`} className="flex justify-center my-4">
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        className="shadow border rounded"
                      />
                    </div>
                  ))}
                </Document>
              ) : (
                <p className="text-red-500 text-center py-4">PDF URL is invalid.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayAppointments.map((item, index) => (
          <div key={item._id} className="border p-4 rounded-lg shadow-sm bg-white sm:grid hidden grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center gap-2">
            <p>{index + 1}</p>
            <div className="flex items-center gap-2">
              <img src={item.userData?.image || assets.default_avatar} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
              <p>{item.userData?.name || "N/A"}</p>
            </div>
            <p><span className="text-xs border px-2 rounded-full">{item.payment ? "Online" : "CASH"}</span></p>
            <p>{calculateAge(item.userData?.dob) || "N/A"}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>
            <div className="flex gap-1">
              {item.cancelled ? <span className="text-red-400 text-xs">Cancelled</span> :
                item.isCompleted && !item.reportUrl ? (
                  <button onClick={() => { setSelectedAppointmentId(item._id); setShowInputModal(true); }} className="bg-blue-600 text-white px-2 py-1 text-xs rounded">Upload Report</button>
                ) : item.reportUrl ? (
                  <button onClick={() => handleViewReport(item.reportUrl)}><FaEye className="text-blue-600 w-5 h-5" /></button>
                ) : (
                  <>
                    <img onClick={() => cancelAppointment(item._id)} className="w-6 cursor-pointer hover:scale-105" src={assets.cancel_icon} alt="Cancel" />
                    <img onClick={() => completeAppointment(item._id)} className="w-6 cursor-pointer hover:scale-105" src={assets.tick_icon} alt="Complete" />
                    {!item.confirmed && <img onClick={() => confirmAppointment(item._id)} className="w-6 cursor-pointer hover:scale-105" src={assets.confirm_icon} alt="Confirm" />}
                  </>
                )
              }
            </div>
          </div>
        ))}

        {/* Mobile view as cards */}
        {displayAppointments.map((item, index) => (
          <div key={`mobile-${item._id}`} className="sm:hidden border rounded-lg p-4 mb-3 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <img src={item.userData?.image || assets.default_avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-base">{item.userData?.name || "N/A"}</p>
                  <p className="text-xs text-gray-500">{calculateAge(item.userData?.dob)} years</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{item.payment ? "Online" : "CASH"}</span>
            </div>
            <p className="text-sm mb-1"><b>Time:</b> {slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p className="text-sm mb-1"><b>Fees:</b> {currency}{item.amount}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {item.cancelled ? <span className="text-red-500 text-xs">Cancelled</span> :
                item.isCompleted && !item.reportUrl ? (
                  <button onClick={() => { setSelectedAppointmentId(item._id); setShowInputModal(true); }} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Upload Report</button>
                ) : item.reportUrl ? (
                  <button onClick={() => handleViewReport(item.reportUrl)} className="text-blue-600 text-xs flex items-center gap-1"><FaEye /> View Report</button>
                ) : (
                  <>
                    <img onClick={() => cancelAppointment(item._id)} className="w-6 cursor-pointer hover:scale-105" src={assets.cancel_icon} alt="Cancel" />
                    <img onClick={() => completeAppointment(item._id)} className="w-6 cursor-pointer hover:scale-105" src={assets.tick_icon} alt="Complete" />
                    {!item.confirmed && <img onClick={() => confirmAppointment(item._id)} className="w-6 cursor-pointer hover:scale-105" src={assets.confirm_icon} alt="Confirm" />}
                  </>
                )
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
