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
    title: "Album Title",
    artist: "Artist Name",
    year: "2023",
    cover: "/live/record-01.jpg",
  },
  {
    id: "record-02",
    title: "Album Title",
    artist: "Artist Name",
    year: "2021",
    cover: "/live/record-02.jpg",
  },
  {
    id: "record-03",
    title: "Album Title",
    artist: "Artist Name",
    year: "2020",
    cover: "/live/record-03.jpg",
  },
  {
    id: "record-04",
    title: "Album Title",
    artist: "Artist Name",
    year: "2019",
    cover: "/live/record-04.jpg",
  },
  {
    id: "record-05",
    title: "Album Title",
    artist: "Artist Name",
    year: "2018",
    cover: "/live/record-05.jpg",
  },
  {
    id: "record-06",
    title: "Album Title",
    artist: "Artist Name",
    year: "2017",
    cover: "/live/record-06.jpg",
  },
  {
    id: "record-07",
    title: "Album Title",
    artist: "Artist Name",
    year: "2016",
    cover: "/live/record-07.jpg",
  },
  {
    id: "record-08",
    title: "Album Title",
    artist: "Artist Name",
    year: "2015",
    cover: "/live/record-08.jpg",
  },
  {
    id: "record-09",
    title: "Album Title",
    artist: "Artist Name",
    year: "2014",
    cover: "/live/record-09.jpg",
  },
  {
    id: "record-10",
    title: "Album Title",
    artist: "Artist Name",
    year: "2013",
    cover: "/live/record-10.jpg",
  },
];
