"use client";

export default function TradePanel() {
  return (
    <div className="rounded border p-4">
      <div className="font-semibold">Trade</div>
      <input className="border p-2 w-full mt-2" placeholder="Amount" />
      <button className="mt-2 rounded bg-black text-white px-4 py-2">Execute trade</button>
    </div>
  );
}
