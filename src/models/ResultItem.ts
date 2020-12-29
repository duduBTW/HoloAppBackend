export enum resultItemType {
  Youtube = 1,
  Reddit = 2,
  Twitter = 3,
}

interface ImageProp {
  low?: string;
  medium?: string;
  higth?: string;
}

export default interface reusltItem {
  type: resultItemType;
  id: string;
  image?: string;
  date: string;
  title?: string;
}
