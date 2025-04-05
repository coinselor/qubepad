"use client";
import { Clock } from "lucide-react";
import useSWR from "swr";

type SystemInfo = {
  lastUpdate: string | null;
};

export default function LastUpdateFooter() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: SystemInfo }>(
    "/api/system",
    { revalidateOnFocus: false } 
  );
  
  if (isLoading) {    return (
      <div className="w-full text-center text-xs text-zinc-500 mt-4 flex items-center justify-center gap-1.5">
        <Clock className="h-3 w-3" />
        <span>Loading update information...</span>
      </div>
    );
  }
  
  if (error || !data?.success || !data.data.lastUpdate) {
    return null;
  }
  
  const lastUpdate = new Date(data.data.lastUpdate);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  const timeAgo = (date: Date) => {
    const now = new Date().getTime();
    const diff = now - date.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}, ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
  };
  
  return (
    <div className="w-full text-center text-xs text-zinc-500 mt-4 flex items-center justify-center gap-1.5">
      <Clock className="h-3 w-3" />
      <span>
        Last updated: <span className="text-zinc-400">{timeAgo(lastUpdate)}</span> ({formatDate(lastUpdate)})
      </span>
    </div>
  );
}
