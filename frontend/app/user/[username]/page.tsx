import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UserProfileClient from './UserProfileClient';

interface Props { params: { username: string } }

async function getUser(username: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json());
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getUser(params.username);
  if (!data) return { title: 'User Not Found' };
  return { title: `${data.user.name} (@${data.user.username})`, description: data.user.bio || `Posts by ${data.user.name}` };
}

export default async function UserPage({ params }: Props) {
  const data = await getUser(params.username);
  if (!data) notFound();
  return <UserProfileClient initialUser={data.user} initialBlogs={data.blogs} />;
}
