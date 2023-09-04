"use client";

import Script from "next/script";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Map } from "react-kakao-maps-sdk";
import { getRoute } from "./api";
import { RouterInterface, tourItem, tourList } from "./data";
import "./index.css";

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
  }>({
    origin: { name: "제주 공항", lat: 33.51111, lng: 126.49277 },
    destination: {
      name: "카카오 스페이스 닷 원",
      lat: 33.45002,
      lng: 126.57033,
    },
  });
  const [kakaoLoad, setKakaoLoad] = useState(false);

  const handlePositionChange = (
    e: MouseEvent<HTMLButtonElement>,
    item: tourItem
  ) => {
    const id = e.currentTarget.id;
    const name = e.currentTarget.innerText;

    if (id === "origin")
      if (name !== position.origin?.name)
        if (name !== position.destination?.name)
          setPosition((prev) => ({ ...prev, origin: item }));
    if (id === "destination")
      if (name !== position.destination?.name)
        if (name !== position.origin?.name)
          setPosition((prev) => ({ ...prev, destination: item }));
  };

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

    map.setBounds(new kakao.maps.LatLngBounds(sw, ne), 70, 50, 70, 100);
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

      //draw path
      if (!window.kakao) return;
      const linePath: kakao.maps.LatLng[] = [];
      res.routes[0].sections[0].roads.forEach((router: RouterInterface) => {
        router.vertexes.forEach((vertex, index) => {
          // x,y 좌표가 우르르 들어옵니다. 그래서 인덱스가 짝수일 때만 linePath에 넣어봅시다.
          // 저도 실수한 것인데 lat이 y이고 lng이 x입니다.
          if (index % 2 === 0) {
            linePath.push(
              new kakao.maps.LatLng(
                router.vertexes[index + 1],
                router.vertexes[index]
              )
            );
          }
        });
      });
      let polyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: "#000000",
        strokeOpacity: 0.7,
        strokeStyle: "solid",
      });

      if (!mapRef.current) return;
      const map: kakao.maps.Map = mapRef.current;
      polyline.setMap(map);
    });
  };

  useEffect(() => {
    if (!position.origin || !position.destination) return;
    newPath({
      origin: `${position.origin.lng}, ${position.origin.lat},name=${position.origin.name}`,
      destination: `${position.destination.lng}, ${position.destination.lat},name=${position.destination.name}`,
    });
  }, [position]);

  return (
    <div>
      <h1>Draw Path</h1>
      <Script
        src={KAKAO_SDK_URL}
        strategy="lazyOnload"
        onLoad={() => {
          getRoute({
            origin: "126.49277, 33.51111,name=제주공항",
            destination: "126.57033,33.45002,name=카카오스페이스닷원",
          }).then((res) => {
            console.log(res);
            const bound = res.routes[0].sections[0].bound;
            console.log(bound);

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
          if (window.kakao) setKakaoLoad(true);
        }}
      />
      {kakaoLoad ? (
        <Map
          center={mapState.center}
          level={3}
          style={{ width: "100%", height: "400px" }}
          ref={mapRef}
        />
      ) : (
        <div style={{ width: "100%", height: "400px" }} />
      )}
      <div className="control_box">
        <div>
          <h3>
            출발지 : {position.origin?.name} @{position.origin?.lat},
            {position.origin?.lng}
          </h3>
          <div className="button_box">
            {tourList.map((item) => (
              // setMapState((prev) => ({ ...prev, center: { lat, lng } }));
              <button
                className="origin_btn"
                key={item.name}
                id="origin"
                onClick={(e) => handlePositionChange(e, item)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3>
            목적지 : {position.destination?.name} @{position.destination?.lat},
            {position.destination?.lng}
          </h3>
          <div className="button_box">
            {tourList.map((item) => (
              <button
                className="destination_btn"
                key={item.name}
                id="destination"
                onClick={(e) => handlePositionChange(e, item)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
