import React from "react";
import Map from "components/molecules/Map";
import UserList from "components/molecules/UserList";
import NavBar from "components/molecules/NavBar";
import PartyTitle from "components/molecules/PartyTitle";
import "./LoggedInPartyPage.scss";
import Chatbox from "components/organisms/Chatbox";
import RoomList from "components/organisms/RoomList";

const LoggedInPartyPage = ({ config, users, attendances }) => (
  <>
    <NavBar isUserLoggedIn />
    <div className="container">
      <div className="row">
        <div className="col small-right-margin">
          <PartyTitle startUtcSeconds={config.start_utc_seconds} />
          <Map config={config} attendances={attendances} />
          <RoomList
            startUtcSeconds={config.start_utc_seconds}
            rooms={config.rooms}
            attendances={attendances}
          />
        </div>
        <div className="col-3">
          <div className="row">{users && <UserList users={users} />}</div>
          <div className="row">
            <Chatbox />
          </div>
        </div>
      </div>
    </div>
  </>
);

export default LoggedInPartyPage;
