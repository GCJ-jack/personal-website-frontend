export type LiveVideo = {
  id: string;
  title: string;
  date: string;
  description?: string;
  file: string;
  cover?: string;
};

export const liveVideos: LiveVideo[] = [
  {
    id: "live-01",
    title: "Best View to Winter",
    date: "2024-06-18",
    description: "Add your show notes here.",
    file: "/live/01.mp4",
    cover: "/live/01.jpg",
  },
  {
    id: "live-02",
    title: "Live Show Snippet",
    date: "2024-07-02",
    description: "Replace with your real show details.",
    file: "/live/02.mp4",
    cover: "/live/02.jpg",
  },
];

export type TopRecord = {
  id: string;
  title: string;
  artist: string;
  year?: string;
  cover?: string;
};

export const topRecords: TopRecord[] = [
  {
    id: "record-01",
    title: "Late Registration",
    artist: "Kanye West",
    year: "2005",
    cover: "/live/record-02.png",
  },
  {
    id: "record-02",
    title: "The Low End Theory",
    artist: "A Tribe Called Quest",
    year: "1991",
    cover: "/live/record-01.png",
  },
  {
    id: "record-03",
    title: "The Main Ingredient",
    artist: "Pete Rock & CL Smooth",
    year: "1994",
    cover: "/live/record-03.png",
  },
  {
    id: "record-04",
    title: "Atrocity Exhibition",
    artist: "Danny Brown",
    year: "2016",
    cover: "/live/record-04.png",
  },
  {
    id: "record-05",
    title: "The Infamous",
    artist: "Mobb Deep",
    year: "1995",
    cover: "/live/record-05.png",
  },
  {
    id: "record-06",
    title: "Only Built 4 Cuban Linx...",
    artist: "Raekwon",
    year: "1995",
    cover: "/live/record-06.png",
  },
  {
    id: "record-07",
    title: "Yeezus",
    artist: "Kanye West",
    year: "2013",
    cover: "/live/record-07.png",
  },
  {
    id: "record-08",
    title: "Stress: The Extinction Agenda",
    artist: "Organized Konfusion",
    year: "1994",
    cover: "/live/record-08.png",
  },
  {
    id: "record-09",
    title: "Hiding Places",
    artist: "billy woods & Kenny Segal",
    year: "2019",
    cover: "/live/record-09.png",
  },
  {
    id: "record-10",
    title: "Pinata",
    artist: "Freddie Gibbs & Madlib",
    year: "2014",
    cover: "/live/record-10.png",
  },
];
