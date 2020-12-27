export enum resultItemType {
  Youtube = 'Youtube',
  Reddit = 'Reddit',
  Twitter = 'Twitter',
}

interface ImageProp {
  low?: string;
  medium?: string;
  higth?: string;
}

export default interface reusltItem {
  type: resultItemType;
  id: string;
  image?: ImageProp;
  date: string;
  title?: string;
}
