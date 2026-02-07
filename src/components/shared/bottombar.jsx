"use client";

import React from "react";
import {
  Bot,
  Columns2,
  EllipsisVertical,
  Rows3,
  ShoppingBasket,
  SlidersHorizontal,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomBar = () => {
  const pathname = usePathname();
  const NavIcons = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.6597 5.75C10.8236 5.75 10.2857 6.34219 10.2857 6.90909C10.2857 7.3233 9.94987 7.65909 9.53566 7.65909C9.12145 7.65909 8.78566 7.3233 8.78566 6.90909C8.78566 5.36727 10.1497 4.25 11.6597 4.25C13.1697 4.25 14.5337 5.36727 14.5337 6.90909C14.5337 7.58928 14.2865 8.22354 13.8444 8.7044C13.7045 8.85669 13.5496 9.00942 13.4085 9.14851C13.3834 9.17327 13.3587 9.1976 13.3346 9.22141C13.1675 9.38672 13.0202 9.53616 12.8939 9.68456C12.8066 9.78721 12.7396 9.87796 12.6889 9.95888C13.2574 10.0668 13.8094 10.2856 14.3035 10.6187L21.736 15.629C22.6856 16.2692 22.9429 17.3256 22.6125 18.2165C22.2875 19.0928 21.4219 19.75 20.2973 19.75H3.70231C2.58964 19.75 1.72778 19.1049 1.39567 18.2392C1.05806 17.3591 1.29658 16.3086 2.22358 15.6566L9.31927 10.6653C9.85574 10.2879 10.4656 10.0483 11.093 9.94251C11.1984 9.43649 11.4859 9.02479 11.7513 8.71278C11.9231 8.51074 12.1111 8.32181 12.2797 8.15509C12.3074 8.12767 12.3345 8.10096 12.3609 8.07485C12.5028 7.93486 12.6272 7.81207 12.7402 7.68925C12.9223 7.49112 13.0337 7.22136 13.0337 6.90909C13.0337 6.34219 12.4958 5.75 11.6597 5.75ZM13.4651 11.8624C12.9825 11.5371 12.3993 11.373 11.81 11.3799C11.2256 11.3866 10.6525 11.5614 10.1823 11.8922L3.08659 16.8834C2.7415 17.1262 2.69597 17.4407 2.79616 17.7019C2.90185 17.9775 3.19965 18.25 3.70231 18.25H20.2973C20.8056 18.25 21.103 17.9729 21.2061 17.6949C21.3038 17.4314 21.2543 17.1133 20.8976 16.8728L13.4651 11.8624Z"
              fill="currentColor"
            ></path>{" "}
          </g>
        </svg>
      ),
      name: "Wear",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.94358 1.25H14.0564C15.8942 1.24998 17.3498 1.24997 18.489 1.40314C19.6614 1.56076 20.6104 1.89288 21.3588 2.64124C22.1071 3.38961 22.4392 4.33856 22.5969 5.51098C22.75 6.65019 22.75 8.10583 22.75 9.94359V12.0564C22.75 13.8942 22.75 15.3498 22.5969 16.489C22.4392 17.6614 22.1071 18.6104 21.3588 19.3588C20.8948 19.8227 20.3538 20.1267 19.7302 20.3282C19.7432 20.3834 19.75 20.4409 19.75 20.5V22C19.75 22.4142 19.4142 22.75 19 22.75C18.5858 22.75 18.25 22.4142 18.25 22V20.6263C17.1482 20.75 15.7681 20.75 14.0564 20.75H9.94359C8.23194 20.75 6.85177 20.75 5.75 20.6263V22C5.75 22.4142 5.41421 22.75 5 22.75C4.58579 22.75 4.25 22.4142 4.25 22V20.5C4.25 20.4409 4.25684 20.3834 4.26976 20.3282C3.6462 20.1267 3.10518 19.8227 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V9.94358C1.24998 8.10582 1.24997 6.65019 1.40314 5.51098C1.56076 4.33856 1.89288 3.38961 2.64124 2.64124C3.38961 1.89288 4.33856 1.56076 5.51098 1.40314C6.65019 1.24997 8.10582 1.24998 9.94358 1.25ZM12.75 19.25H14C15.9068 19.25 17.2615 19.2484 18.2892 19.1102C19.2952 18.975 19.8749 18.7213 20.2981 18.2981C20.7213 17.8749 20.975 17.2952 21.1102 16.2892C21.2484 15.2615 21.25 13.9068 21.25 12V10C21.25 8.09318 21.2484 6.73851 21.1102 5.71085C20.975 4.70476 20.7213 4.12511 20.2981 3.7019C19.8749 3.27869 19.2952 3.02502 18.2892 2.88976C17.2615 2.75159 15.9068 2.75 14 2.75H12.75V19.25ZM11.25 2.75V19.25H10C8.09318 19.25 6.73851 19.2484 5.71085 19.1102C4.70476 18.975 4.12511 18.7213 3.7019 18.2981C3.27869 17.8749 3.02502 17.2952 2.88976 16.2892C2.75159 15.2615 2.75 13.9068 2.75 12V10C2.75 8.09318 2.75159 6.73851 2.88976 5.71085C3.02502 4.70476 3.27869 4.12511 3.7019 3.7019C4.12511 3.27869 4.70476 3.02502 5.71085 2.88976C6.73851 2.75159 8.09318 2.75 10 2.75H11.25ZM9 8.25C9.41421 8.25 9.75 8.58579 9.75 9V13C9.75 13.4142 9.41421 13.75 9 13.75C8.58579 13.75 8.25 13.4142 8.25 13V9C8.25 8.58579 8.58579 8.25 9 8.25ZM15 8.25C15.4142 8.25 15.75 8.58579 15.75 9V13C15.75 13.4142 15.4142 13.75 15 13.75C14.5858 13.75 14.25 13.4142 14.25 13V9C14.25 8.58579 14.5858 8.25 15 8.25Z"
              fill="currentColor"
            ></path>{" "}
          </g>
        </svg>
      ),
      name: "Wardrobe",
    },
    {
      icon: <ShoppingBasket className="h-6 w-6" />,
      name: "Laundry",
    },
    {
      icon: <Store className="h-6 w-6" />,
      name: "Shop",
    },
    {
      icon: <EllipsisVertical className="h-6 w-6" />,
      name: "Settings",
    },
  ];
  return (
    <div className="relative space-y-5 rounded-[32px] border border-white/60  py-5">
      <nav className="fixed bottom-0 left-0 z-20 w-full border border-white/10 bg-black py-2 px-5 rounded-t-3xl">
        <div className="flex items-center justify-between">
          {NavIcons.map((item, index) => {
            const path = `/my-closet/${item.name.toLowerCase()}`;
            const isActive =
              pathname === path || pathname?.startsWith(`${path}/`);

            return (
              <Link key={index} href={path} passHref>
                <button
                  type="button"
                  className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px] font-medium tracking-wide transition-colors ${
                    isActive
                      ? "text-[#fc7962]"
                      : "text-gray-400 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex h-6 w-6 items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="teachers">{item.name}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default BottomBar;
