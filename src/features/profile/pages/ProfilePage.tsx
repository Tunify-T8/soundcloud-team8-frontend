import Header from "../components/Header";

export default function ProfilePage() {
  return (
    <div className="min-h-screen text-white">
      <Header src="/path/to/header-image.jpg" name="John Doe" username="johndoe" />
      <h1 className="text-3xl font-bold p-6">Profile Page</h1>
      {/* Add profile details and tracks here */}
    </div>
  );
}
