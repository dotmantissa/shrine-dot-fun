import AIVibeScore from "../../components/AIVibeScore";
import SocialPulse from "../../components/SocialPulse";
import BondingCurveChart from "../../components/BondingCurveChart";
import TradePanel from "../../components/TradePanel";

export default function TokenPage() {
  return (
    <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="space-y-3">
        <AIVibeScore tokenAddress="0x0" size="large" score={{ vibeRating: 72, rugRisk: 38, summary: "Active and growing", scored: true }} />
        <SocialPulse tokenAddress="0x0" twitterHandle="@shrine" mentions={42} />
      </div>
      <BondingCurveChart />
      <TradePanel />
    </main>
  );
}
