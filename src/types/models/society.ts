import { Address } from "./address";

export type Society = {
  id: string;
  name: string;
  code: string;
  address: Address;
  latitude: number;
  longitude: number;
  image_url: string | null;
  created_at: string;
};

