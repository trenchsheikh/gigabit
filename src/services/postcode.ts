// UK Postcode API Service
// Using postcodes.io - a free UK postcode API

export interface PostcodeData {
  postcode: string;
  quality: number;
  eastings?: number;
  northings?: number;
  country: string;
  nhs_ha?: string;
  longitude?: number;
  latitude?: number;
  european_electoral_region?: string;
  primary_care_trust?: string;
  region?: string;
  lsoa?: string;
  msoa?: string;
  incode?: string;
  outcode?: string;
  parliamentary_constituency?: string;
  admin_district?: string;
  parish?: string;
  admin_county?: string;
  admin_ward?: string;
  ced?: string;
  ccg?: string;
  nuts?: string;
  codes?: {
    admin_district?: string;
    admin_county?: string;
    admin_ward?: string;
    parish?: string;
    parliamentary_constituency?: string;
    ccg?: string;
    ccg_id?: string;
    ced?: string;
    nuts?: string;
  };
}

interface PostcodeApiResponse {
  status: number;
  result?: PostcodeData;
  error?: string;
}

export const postcodeService = {
  async searchPostcode(postcode: string): Promise<PostcodeData | null> {
    try {
      // Format postcode for API (remove spaces, uppercase)
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}`;

      const response = await fetch(url);
      const data: PostcodeApiResponse = await response.json();

      if (data.status === 200 && data.result) {
        return data.result;
      } else {
        console.error('Postcode API error:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Postcode search error:', error);
      throw error;
    }
  },

  async validatePostcode(postcode: string): Promise<boolean> {
    try {
      const formattedPostcode = postcode.replace(/\s+/g, '').toUpperCase();
      const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(formattedPostcode)}/validate`;

      const response = await fetch(url);
      const data = await response.json();

      return data.result === true;
    } catch (error) {
      console.error('Postcode validation error:', error);
      return false;
    }
  },
};





