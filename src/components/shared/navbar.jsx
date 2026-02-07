"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Bell, ChevronsUpDown, Dot, Shirt, ShoppingBasket, WashingMachine } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isCloset, setIsCloset] = useState(true);
  const router = useRouter();

  const handleSwitch = () => {
    if (isCloset) {
      router.push("/my-closet/laundry"); // go to laundry room
    } else {
      router.push("/my-closet/wardrobe"); // go back to closet
    }
    setIsCloset(!isCloset);
  };

  return (
    <nav className="flex items-center justify-between ">
      <Button
        className="flex items-center h-12 rounded-full justify-between w-[200px]"
        onClick={handleSwitch}
      >
        <h1 className="flex items-center gap-2 text-p">
          {isCloset ? (
            <>
              <Shirt className="w-5 h-5" /> MY CLOSET
            </>
          ) : (
            <>
              <WashingMachine className="w-5 h-5" /> LAUNDRY ROOM
            </>
          )}
        </h1>

        <div className="flex items-center">
          <ChevronsUpDown />
        </div>
      </Button>

      <div className="flex gap-2">
        <Button className={"w-10 h-10 relative rounded-full"}>
          <ShoppingBasket/>
          <Dot className="absolute bottom-3 left-3 size-8 text-red-500" />
        </Button>
        <img
          className="w-10 h-10 rounded-full"
          src="https://avatars.githubusercontent.com/u/16860528"
          alt="avatar"
        />
      </div>
    </nav>
  );
};

export default Navbar;
