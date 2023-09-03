import axios from "axios";

export const getRoute = async ({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) => {
  const url = "https://apis-navi.kakaomobility.com/v1/directions";
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_REST_KEY;

  const params = { origin, destination };

  const response = await axios
    .get(url, {
      params,
      headers: {
        Authorization: `KakaoAK ${kakaoKey}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      // console.log(res);
      return res.data;
    })
    .catch((err) => console.log(err));

  return response;
};
