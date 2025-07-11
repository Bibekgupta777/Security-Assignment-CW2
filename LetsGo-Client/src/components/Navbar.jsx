import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import UserMenu from "./UserMenu";
import LetsGoLogo from "/Logo/LetsGoLogo.png";
import { useLocation } from 'react-router-dom';

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { userInfo } = useContext(UserContext);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", current: location.pathname === "/" },
    { name: "Destination", href: "/destinations", current: location.pathname === "/destinations" },
    { name: "Search", href: "#", current: false },
    { name: "Contact Us", href: "/contact", current: location.pathname === "/contact" },
  ];

  const handleScrollToSearch = () => {
    if (location.pathname !== "/") {
      // If not on home page, navigate to home page first
      window.location.href = "/#search-section";
      return;
    }
    const searchSection = document.getElementById("search-section");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Disclosure as="nav" className="">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
              <div className="flex flex-1 items-center justify-between sm:items-stretch sm:justify-start">
                <div className="sm:flex hidden shrink-0 items-center">
                  <a href="/">
                    <img
                      alt="LetsGo Logo"
                      src={LetsGoLogo}
                      className="h-12 w-auto"
                    />
                  </a>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) =>
                      item.name === "Search" ? (
                        <button
                          key={item.name}
                          onClick={handleScrollToSearch}
                          className={classNames(
                            "text-gray-800 hover:bg-green-600 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                        >
                          {item.name}
                        </button>
                      ) : (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-green-600 text-white"
                              : "text-gray-800 hover:bg-green-600 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                        >
                          {item.name}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
              <UserMenu userInfo={userInfo} />
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) =>
                item.name === "Search" ? (
                  <DisclosureButton
                    key={item.name}
                    as="button"
                    onClick={handleScrollToSearch}
                    className={classNames(
                      "text-gray-300 hover:bg-green-600 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium w-full text-left"
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                ) : (
                  <DisclosureButton
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:bg-green-600 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                  >
                    {item.name}
                  </DisclosureButton>
                )
              )}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}