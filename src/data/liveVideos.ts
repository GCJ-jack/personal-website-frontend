export type LiveVideo = {
  id: string;
  title: string;
  date: string;
  description?: string;
  file: string;
};

export const liveVideos: LiveVideo[] = [
  {
    id: "live-01",
    title: "Best View to Winter",
    date: "2024-06-18",
    description: "Add your show notes here.",
    file: "/live/01.mp4",
  },
  {
    id: "live-02",
    title: "Live Show Snippet",
    date: "2024-07-02",
    description: "Replace with your real show details.",
    file: "/live/02.mp4",
  },
];
