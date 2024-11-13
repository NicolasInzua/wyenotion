import axios from '@/config/axios';

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export const api = {
  fetchPageContent: async (slug: string) => {
    const res = await axios.get(`/api/pages/${slug}/content`);
    return res.data;
  },
  fetchPageList: async () => {
    const res = await axios.get('/api/pages');
    return res.data;
  },
};
