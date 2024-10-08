import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";

const Home = () => {
  const loggedIn = {
    firstName: "Kritika",
    lastName: "Koirala",
    email: "kk@getMaxListeners.com",
  };
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "guest"}
            subtext="Access and manage your account and transactions efficiently"
          />

          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1500.67}
          />
        </header>
        recent transactions
      </div>
      <RightSidebar
        user={loggedIn}
        transaction={[]}
        banks={[{ currentBalance: 2000.45 }, { currentBalance: 123.98 }]}
      />
    </section>
  );
};

export default Home;
