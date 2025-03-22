import React from "react";
import Header from "../components/Header";
import SpecialityMenu from "../components/SpecialityMenu";
import TopDoctors from "../components/TopDoctors";
import Banner from "../components/Banner";
import Bot from "../components/Bot";

const Home = () => {
  return (
    <div className="relative">
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
      <Bot />
    </div>
  );
};

export default Home;
