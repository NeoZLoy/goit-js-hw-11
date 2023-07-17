import axios from 'axios';
const API_KEY = '38314645-d57637d53f9e89632580f05c8';

async function getImages(querry, page) {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${querry}&image_type=photo&per_page=40&page=${page}
  &orientation=horizontal&safesearch=true`;
  const result = await axios.get(url);
  return result.data;
}


export { getImages};