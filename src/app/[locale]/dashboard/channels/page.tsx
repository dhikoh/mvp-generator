
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import prisma from "@/lib/prisma";

import ChannelManagerClient from "./ChannelManagerClient";

export default async function ManageChannelsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const channels = await prisma.profileChannel.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <ChannelManagerClient initialChannels={channels} />
  );
}
