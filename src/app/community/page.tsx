import { PollCard } from "@/components/PollCard";

const polls = [
  {
    id: "coffee-style",
    question: "Preferred coffee style for a Bloom & Brew visit?",
    options: ["Iced matcha latte", "Pour-over coffee", "Cappuccino"],
  },
  {
    id: "flower-type",
    question: "Which flower should headline the weekly bouquet?",
    options: ["Tulips", "Ranunculus", "Sweet pea"],
  },
  {
    id: "cafe-atmosphere",
    question: "Best cafe atmosphere for community posts?",
    options: ["Quiet reading corner", "Plant-filled social table", "Vintage coffee bar"],
  },
];

export default function CommunityPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c45572]">
          Community picks
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#211f1d]">
          Lightweight engagement loop
        </h1>
        <p className="mt-4 text-base leading-7 text-[#6f6259]">
          Polls let visitors participate in the content direction and demonstrate
          the post, interact, feedback, improve cycle from the project spec.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {polls.map((poll) => (
          <PollCard
            key={poll.id}
            id={poll.id}
            question={poll.question}
            options={poll.options}
          />
        ))}
      </div>
    </main>
  );
}
