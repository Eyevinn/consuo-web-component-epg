export const update = async (apiUrl, channelId) => {
  const today = new Date().toLocaleDateString();
  const url = `${apiUrl}/channels/${channelId}/schedule?date=${today}}`;
  const response = await fetch(url);
  const schedule = await response.json();
  return schedule || [];
};
