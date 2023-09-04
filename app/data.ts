export interface tourItem {
  name: string;
  lat: number;
  lng: number;
}

export interface RouterInterface {
  name: string;
  distance: number;
  duration: number;
  traffic_speed: number;
  traffic_state: number;
  vertexes: number[];
}

export const tourList: tourItem[] = [
  { name: "제주 공항", lat: 33.51111, lng: 126.49277 },
  { name: "카카오 스페이스 닷 원", lat: 33.45002, lng: 126.57033 },
  { name: "플레이스 캠프 제주", lat: 33.44999, lng: 126.918378 },
];
