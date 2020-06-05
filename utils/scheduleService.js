export const update = async (apiUrl, channelId) => {
  const now = Date.now();
  const startPoint = now - 3600 * 1000;
  const url = `${apiUrl}/channels/${channelId}/schedule?start=${startPoint}`;
  const response = await fetch(url);
  const schedule = await response.json();
  return schedule || [];
};
