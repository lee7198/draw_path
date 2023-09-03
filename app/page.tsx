"use client";

import Script from "next/script";
import { DOMElement, useEffect, useRef, useState } from "react";
import { Map, MapComponent } from "react-kakao-maps-sdk";
import { getRoute } from "./api";
import "./index.css";

interface tourItem {
  name: string;
  lat: number;
  lng: number;
}

const tourList: tourItem[] = [
  { name: "제주 공항", lat: 33.51111, lng: 126.49277 },
  { name: "카카오 스페이스 닷 원", lat: 33.45002, lng: 126.57033 },
  { name: "플레이스 캠프 제주", lat: 33.44999, lng: 126.918378 },
];

export default function Home() {
  const mapRef = useRef(null);
  const [mapState, setMapState] = useState({
    center: { lat: 33.51111, lng: 126.49277 },
    level: 3,
  });
  const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_KEY}&autoload=false`;
  const [position, setPosition] = useState<{
    origin?: tourItem;
    destination?: tourItem;
  }>({ origin: undefined, destination: undefined });

  const setBoundary = ({
    min_x,
    min_y,
    max_x,
    max_y,
  }: {
    min_x: number;
    min_y: number;
    max_x: number;
    max_y: number;
  }) => {
    if (!mapRef.current) return;

    const map: kakao.maps.Map = mapRef.current;
    const sw = new kakao.maps.LatLng(min_y, min_x),
      ne = new kakao.maps.LatLng(max_y, max_x);

    map.setBounds(new kakao.maps.LatLngBounds(sw, ne));
  };

  const newPath = ({
    origin,
    destination,
  }: {
    origin: string;
    destination: string;
  }) => {
    getRoute({
      origin,
      destination,
    }).then((res) => {
      // console.log(res);
      const bound = res.routes[0].sections[0].bound;

      const lat = (bound.min_y + bound.max_y) / 2;
      const lng = (bound.min_x + bound.max_x) / 2;

      setMapState((prev) => ({ ...prev, center: { lat, lng } }));
      setBoundary({
        max_x: bound.max_x,
        max_y: bound.max_y,
        min_x: bound.min_x,
        min_y: bound.min_y,
      });
    });
  };

  useEffect(() => {
    getRoute({
      origin: "127.111202,37.394912,name=판교역",
      destination: "127.105792,37.359413,name=네이버",
    }).then((res) => {
      console.log(res);
      const bound = res.routes[0].sections[0].bound;

      const lat = (bound.min_y + bound.max_y) / 2;
      const lng = (bound.min_x + bound.max_x) / 2;

      setMapState((prev) => ({ ...prev, center: { lat, lng } }));
      setBoundary({
        max_x: bound.max_x,
        max_y: bound.max_y,
        min_x: bound.min_x,
        min_y: bound.min_y,
      });
    });
  }, [mapRef.current]);

  return (
    <div>
      <h1>Draw Path</h1>
      <Script src={KAKAO_SDK_URL} strategy="beforeInteractive" />
      <Map
        center={mapState.center}
        level={3}
        style={{ width: "100%", height: "520px" }}
        ref={mapRef}
      />
      <div className="control_box">
        <div>
          <h3>출발지</h3>
          <div className="button_box">
            {tourList.map((item) => (
              <span className="origin_btn" key={item.name}>
                {item.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3>목적지</h3>
          <div className="button_box">
            {tourList.map((item) => (
              <span className="destination_btn" key={item.name}>
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
