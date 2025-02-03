import Profile from "./profile";

export default async function ProfilePage(
    { params }: { params: Promise<{ did: string }> }
  ) {
    const slug = (await params).did
    return <Profile did={slug} /> // 'a', 'b', or 'c'
  }
