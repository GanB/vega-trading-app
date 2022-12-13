import { GuestUserViews } from "./GuestUserViews";
import { RegisteredUserViews } from "./RegisteredUserViews";

export const ApplicationViews = (props) => {
  // const appUser = localStorage.getItem("registered_app_user");
  const appUser = JSON.parse(sessionStorage.getItem("app_user"));

  if (appUser.isRegisteredUser) {
    console.log(appUser);
    return <RegisteredUserViews props={appUser} />;
  } else {
    return <GuestUserViews props={appUser} />;
  }
};
