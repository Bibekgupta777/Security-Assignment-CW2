import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { LuBus } from "react-icons/lu";
const UserMenu = () => {
  const { userInfo, logout } = useContext(UserContext);

  // Determine the profile link based on role
  const profileLink =
    userInfo?.role === "admin" ? "/admin/dashboard" : "/profile";

  return (
    <div className="relative">
      {/* Show user avatar and name */}
      {userInfo && userInfo.name ? (
        <div className="flex items-center mx-3 focus:outline-none cursor-pointer dropdown dropdown-hover dropdown-bottom dropdown-end">
          <div className="absolute sm:block hidden inset-y-0 right-0 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button className="flex items-center gap-1 bg-green-500 text-green-500 font-medium bg-opacity-25 px-4 py-2 rounded-lg">
              <h1>Profile</h1>
              <LuBus className="text-xl " />
            </button>
          </div>

          <div
            tabIndex={0}
            className="dropdown-content menu bg-gray-100 rounded-box z-[1] w-48 p-2 shadow font-gilroyMedium"
          >
            <p className="text-lg mb-2 font-gilroyMedium pl-3">
              {userInfo.name}
            </p>
            <hr className="border-gray-300" />
            <ul>
              <li>
                <Link to={profileLink}>
                  {userInfo.role === "admin"
                    ? "Admin Dashboard"
                    : "Visit Profile"}
                </Link>
              </li>
              <li onClick={logout} className="text-red-500">
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        // Sign-in button if not logged in
        <Link to="/login">
          <button className="flex items-center gap-1 bg-green-500 text-green-500 hover:bg-green-600 hover:text-white font-medium bg-opacity-25 px-4 py-2 rounded-lg">
            Sign In
          </button>
          
        </Link>
      )}
    </div>
  );
};

export default UserMenu;