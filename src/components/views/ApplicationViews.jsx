import { GuestUserViews } from "./GuestUserViews";
import { RegisteredUserViews } from "./RegisteredUserViews";

export const ApplicationViews = () => {
  // const appUser = localStorage.getItem("registered_app_user");
  const appUser = JSON.parse(localStorage.getItem("app_user"));

  if (appUser.isRegisteredUser) {
    return <RegisteredUserViews />;
  } else {
    return <GuestUserViews />;
  }
};
