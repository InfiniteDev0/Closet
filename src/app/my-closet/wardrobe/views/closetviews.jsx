"use client";
import { useState } from "react";

export default function ClosetView({owner}) {
  return (
    <div className="agrandir">
      <h1 className="lg:text-3xl text-2xl">Hi! {owner?.name}</h1>
      <p className="lg:text-xl text-lg">What Will you Wear Today?</p>
    </div>
  );
}
