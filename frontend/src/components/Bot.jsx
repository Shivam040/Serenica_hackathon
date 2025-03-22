import React from "react";
import { assets } from "../assets/assets_frontend/assets";
import { useNavigate } from "react-router-dom";

export default function Bot() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/MRA")}
      className="fixed top-[700px] right-24 w-24 cursor-pointer animate-bounce  px-2 py-2 rounded-full hover:scale-110 "
    >
      <img
        className="rounded-full border-4 border-gray-600"
        src={assets.Botimg}
      />
    </div>
  );
}
