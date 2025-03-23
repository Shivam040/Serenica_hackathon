import React, { useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets_frontend/assets";

const MedicalReportAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [analysisHindi, setAnalysisHindi] = useState("");
  const [language, setLanguage] = useState("hi");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [load, setLoad] = useState(false);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", file.type.includes("pdf") ? "pdf" : "image");
    setLoad(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/analyze",
        formData
      );
      setAnalysis(response.data.analysis_en);
      setAnalysisHindi(response.data.analysis_hi);
    } catch (error) {
      console.error("Error analyzing the report:", error);
    }
  };

  const extractSection = (text, section) => {
    const regex = new RegExp(`# ${section}:\\n([\\s\\S]*?)(?=\\n#|$)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "No information available.";
  };

  return (
    <div className="flex flex-row pr-8">
      <div className="w-1/2 object-fit ">
        <img src={assets.Login_img_3} />
      </div>
      <div className="w-1/2">
        <h1 className="text-5xl font-bold mb-4 text-center mt-5">
          Medical Report Analyzer
        </h1>
        {!analysis ? (
          <div className="container mx-auto  flex justify-center flex-col py-20 px-36 ">
            <div className="pt-24">
              <div className="flex justify-center items-center ">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="text-center w-fit border-2 rounded-2xl p-4"
                />
              </div>
              <div className="p-24 flex justify-center">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Analyze Report
                </button>
              </div>
            </div>
            {!analysis && load && (
              <div role="status" className="flex justify-center">
                <svg
                  aria-hidden="true"
                  class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span class="sr-only">Loading...</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            {analysis && (
              <div className="mt-6 p-4 border rounded shadow-lg bg-gray-100 h-[650px]">
                <h2 className="text-xl font-bold">Analysis Results:</h2>
                <div className="mt-4">
                  <h3 className="font-semibold">Key Findings:</h3>
                  <p className="text-gray-700">
                    {extractSection(analysis, "Key Findings")}
                  </p>

                  <h3 className="font-semibold mt-4">Diagnosis:</h3>
                  <p className="text-gray-700">
                    {extractSection(analysis, "Diagnosis")}
                  </p>

                  <h3 className="font-semibold mt-4">Recommendations:</h3>
                  <p className="text-gray-700">
                    {extractSection(analysis, "Recommendations")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {analysisHindi && (
          <div className="mt-4">
            <label className="mr-2">Select Voice Language:</label>
            <div></div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
            </select>

            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(
                  language === "hi" ? analysisHindi : analysis
                );
                utterance.lang = language === "hi" ? "hi-IN" : "en-US";
                speechSynthesis.speak(utterance);
                setIsSpeaking(true);
              }}
              className="ml-4 bg-green-500 text-white px-4 py-2 rounded"
            >
              Speak
            </button>
            <button
              onClick={() => {
                speechSynthesis.cancel();
                setIsSpeaking(false);
              }}
              className="ml-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReportAnalyzer;
