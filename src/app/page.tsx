import { SocialApp } from "@/components/SocialApp";
import { getRedditFeed } from "@/lib/reddit";

export default async function Home() {
  const feed = await getRedditFeed();

  return (
  <>
    <SocialApp
      redditPosts={feed.posts}
      source={feed.source}
    />

    <section className="mt-10 rounded-xl border border-[#eadfd4] bg-[#fffaf6] p-6">
      <h2 className="text-2xl font-black text-[#211f1d]">
        Not Yet Implemented
      </h2>

      <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-[#211f1d]/80">
        <li>Admin user disable/reactivate controls</li>
        <li>Admin user edit controls</li>
        <li>Admin post moderation/delete controls in the dashboard UI</li>
        <li>Admin search and filter controls for users and posts</li>
        <li>Admin-only management API mutation routes</li>
        <li>Database-backed admin roles and account status fields</li>
        <li>Share analytics by platform/method</li>
        <li>OAuth login</li>
        <li>Email verification</li>
        <li>Password reset</li>
        <li>Friend request accept/decline workflow</li>
        <li>In-app chat / calling</li>
        <li>Database-backed chat messages</li>
        <li>Real-time chat/calling</li>
        <li>Real push notifications</li>
        <li>File upload/object storage</li>
        <li>Real video/audio streaming</li>
        <li>Live-room UI and lifecycle</li>
        <li>Comprehensive server-side authorization rules for every mutation route</li>
      </ul>
    </section>
  </>
);
}
